import React from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Card, 
    CardContent,
    Typography,
    CircularProgress,
    IconButton,
    InputAdornment,
    Collapse,
    Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    attachment?: File | null;
}

interface FormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    attachment?: string;
}

interface ContactFormProps {
    onSubmit: (data: FormData) => Promise<void>;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = React.useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
        attachment: null
    });

    const [errors, setErrors] = React.useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitStatus, setSubmitStatus] = React.useState<'success' | 'error' | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const validateField = (name: keyof FormData, value: string): string => {
        switch (name) {
            case 'name':
                return value.length < 2 ? 'Le nom doit contenir au moins 2 caractères' : '';
            case 'email':
                return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value) 
                    ? 'Adresse email invalide'
                    : '';
            case 'subject':
                return value.length < 5 ? 'Le sujet doit contenir au moins 5 caractères' : '';
            case 'message':
                return value.length < 10 ? 'Le message doit contenir au moins 10 caractères' : '';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        const error = validateField(name as keyof FormData, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setErrors(prev => ({
                    ...prev,
                    attachment: 'Le fichier ne doit pas dépasser 5MB'
                }));
                return;
            }
            setFormData(prev => ({ ...prev, attachment: file }));
            setErrors(prev => ({ ...prev, attachment: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate all fields
        const newErrors: FormErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'attachment') {
                const error = validateField(
                    key as keyof FormData, 
                    formData[key as keyof FormData] as string
                );
                if (error) newErrors[key as keyof FormErrors] = error;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await onSubmit(formData);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                attachment: null
            });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                component={motion.div}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                sx={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
            >
                <CardContent>
                    <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
                        Envoyez-moi un message
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Nom"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={!!errors.name}
                                helperText={errors.name}
                                required
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                required
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <TextField
                                label="Sujet"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                error={!!errors.subject}
                                helperText={errors.subject}
                                required
                                fullWidth
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <TextField
                                label="Message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                error={!!errors.message}
                                helperText={errors.message}
                                required
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                InputProps={{
                                    sx: {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt"
                                />
                                <Button
                                    variant="outlined"
                                    startIcon={<AttachFileIcon />}
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {formData.attachment ? 'Fichier sélectionné' : 'Joindre un fichier'}
                                </Button>
                                {formData.attachment && (
                                    <Typography variant="body2" color="textSecondary">
                                        {formData.attachment.name}
                                    </Typography>
                                )}
                            </Box>

                            {errors.attachment && (
                                <Typography color="error" variant="caption">
                                    {errors.attachment}
                                </Typography>
                            )}

                            <AnimatePresence>
                                {submitStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <Alert 
                                            severity={submitStatus} 
                                            sx={{ mb: 2 }}
                                            icon={submitStatus === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                                        >
                                            {submitStatus === 'success' 
                                                ? 'Message envoyé avec succès !'
                                                : 'Erreur lors de l\'envoi du message. Veuillez réessayer.'}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={isSubmitting}
                                endIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                                sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    height: 48
                                }}
                            >
                                {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};
