import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Rating,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { resourceApi, type ResourceInput, type ResourceName, type ResourceTypes } from "../../api";
import { ApiError } from "../../api/client";

/**
 * Panneau CRUD générique du tableau de bord (§4.2).
 * Une seule implémentation pour les 5 ressources : seule la configuration
 * (champs du formulaire + rendu d'une ligne) change, cf. resources.tsx.
 *  - création / modification dans une boîte de dialogue ;
 *  - suppression avec confirmation ;
 *  - ordre d'affichage modifiable avec les flèches (PUT /api/:ressource/reorder).
 */
export type FieldType = "text" | "textarea" | "date" | "select" | "level" | "lines" | "tags" | "url";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  helper?: string;
  /** Largeur sur 12 colonnes (sur écran large). */
  width?: 6 | 12;
}

export interface ResourceConfig<R extends ResourceName> {
  resource: R;
  title: string;
  singular: string;
  fields: FieldDef[];
  primary: (item: ResourceTypes[R]) => ReactNode;
  secondary?: (item: ResourceTypes[R]) => ReactNode;
  empty: string;
}

type FormState = Record<string, string | number | null>;

/** Objet API -> valeurs du formulaire (les tableaux deviennent du texte éditable). */
function toForm(fields: FieldDef[], item?: Record<string, unknown>): FormState {
  const state: FormState = {};
  for (const f of fields) {
    const v = item?.[f.name];
    if (f.type === "lines") state[f.name] = Array.isArray(v) ? v.join("\n") : "";
    else if (f.type === "tags") state[f.name] = Array.isArray(v) ? v.join(", ") : "";
    else if (f.type === "level") state[f.name] = typeof v === "number" ? v : null;
    else if (f.type === "select") state[f.name] = typeof v === "string" ? v : (f.options?.[0]?.value ?? "");
    else state[f.name] = typeof v === "string" ? v : "";
  }
  return state;
}

/** Valeurs du formulaire -> objet attendu par l'API. */
function fromForm(fields: FieldDef[], state: FormState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    const v = state[f.name];
    if (f.type === "lines")
      out[f.name] = String(v ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (f.type === "tags")
      out[f.name] = String(v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (f.type === "level") out[f.name] = v === null ? null : Number(v);
    else if (f.type === "date") out[f.name] = v ? String(v) : null;
    else out[f.name] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

export function ResourcePanel<R extends ResourceName>({ config }: { config: ResourceConfig<R> }) {
  const client = resourceApi(config.resource);
  const [items, setItems] = useState<ResourceTypes[R][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: number | null; form: FormState } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<ResourceTypes[R] | null>(null);

  const load = useCallback(() => {
    client
      .list()
      .then(setItems)
      .catch((e: Error) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.resource]);

  useEffect(load, [load]);

  const openCreate = () => {
    setFieldErrors({});
    setEditing({ id: null, form: toForm(config.fields) });
  };
  const openEdit = (item: ResourceTypes[R]) => {
    setFieldErrors({});
    setEditing({ id: item.id, form: toForm(config.fields, item as unknown as Record<string, unknown>) });
  };

  const save = async () => {
    if (!editing) return;
    const missing = Object.fromEntries(
      config.fields
        .filter((f) => f.required && !String(editing.form[f.name] ?? "").trim())
        .map((f) => [f.name, "Champ requis"]),
    );
    setFieldErrors(missing);
    if (Object.keys(missing).length) return;

    setSaving(true);
    const payload = fromForm(config.fields, editing.form) as ResourceInput<R>;
    try {
      if (editing.id === null) await client.create(payload);
      else await client.update(editing.id, payload);
      setEditing(null);
      load();
    } catch (e) {
      if (e instanceof ApiError && e.details.length)
        setFieldErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
      else setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await client.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    }
  };

  /** Déplace un élément d'une position (mise à jour optimiste, rechargement si l'API échoue). */
  const move = async (index: number, delta: -1 | 1) => {
    if (!items) return;
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setItems(next);
    try {
      await client.reorder(next.map((i) => i.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      load();
    }
  };

  const setField = (name: string, value: string | number | null) =>
    setEditing((ed) => (ed ? { ...ed, form: { ...ed.form, [name]: value } } : ed));

  return (
    <Box>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, gap: 2, flexWrap: "wrap" }}
      >
        <Typography variant="h4" component="h1" fontWeight={700}>
          {config.title}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Ajouter
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items === null ? (
        <CircularProgress aria-label="Chargement" />
      ) : items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
          {config.empty}
        </Paper>
      ) : (
        <Stack spacing={1.5} component="ol" sx={{ listStyle: "none", p: 0, m: 0 }} aria-label={config.title}>
          {items.map((item, index) => (
            <Paper
              key={item.id}
              component="li"
              variant="outlined"
              sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <Stack>
                <Tooltip title="Monter">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Monter"
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Descendre">
                  <span>
                    <IconButton
                      size="small"
                      aria-label="Descendre"
                      disabled={index === items.length - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} noWrap>
                  {config.primary(item)}
                </Typography>
                {config.secondary && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {config.secondary(item)}
                  </Typography>
                )}
              </Box>
              <Tooltip title="Modifier">
                <IconButton aria-label="Modifier" onClick={() => openEdit(item)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Supprimer">
                <IconButton aria-label="Supprimer" color="error" onClick={() => setToDelete(item)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Stack>
      )}

      {/* ---------- formulaire de création / modification ---------- */}
      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing?.id === null ? `Ajouter : ${config.singular}` : `Modifier : ${config.singular}`}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="resource-form"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}
          >
            {config.fields.map((f) => (
              <Box key={f.name} sx={{ gridColumn: { sm: f.width === 6 ? "auto" : "1 / -1" } }}>
                <FieldInput
                  field={f}
                  value={editing?.form[f.name] ?? null}
                  error={fieldErrors[f.name]}
                  onChange={(v) => setField(f.name, v)}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Annuler</Button>
          <Button type="submit" form="resource-form" variant="contained" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ---------- confirmation de suppression ---------- */}
      <Dialog open={toDelete !== null} onClose={() => setToDelete(null)}>
        <DialogTitle>Supprimer cet élément ?</DialogTitle>
        <DialogContent>
          <Typography>{toDelete && config.primary(toDelete)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={() => void remove()}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function FieldInput({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string | number | null;
  error?: string;
  onChange: (v: string | number | null) => void;
}) {
  const common = { label: field.label, required: field.required, error: !!error, helperText: error ?? field.helper };
  switch (field.type) {
    case "textarea":
    case "lines":
      return (
        <TextField
          {...common}
          multiline
          minRows={field.type === "lines" ? 4 : 3}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "date":
      return (
        <TextField
          {...common}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      );
    case "select":
      return (
        <TextField {...common} select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.options?.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      );
    case "level":
      return (
        <Box>
          <Typography component="legend" variant="body2" color="text.secondary">
            {field.label}
          </Typography>
          <Rating
            value={typeof value === "number" ? value : null}
            max={5}
            onChange={(_, v) => onChange(v)}
            aria-label={field.label}
          />
          {field.helper && (
            <Typography variant="caption" display="block" color="text.secondary">
              {field.helper}
            </Typography>
          )}
        </Box>
      );
    case "url":
      return (
        <TextField
          {...common}
          type="url"
          placeholder="https://"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return <TextField {...common} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}
