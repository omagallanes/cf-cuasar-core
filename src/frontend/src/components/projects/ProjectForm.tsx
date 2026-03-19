import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import FormGroup from '../ui/form/FormGroup';
import FormLabel from '../ui/form/FormLabel';
import FormError from '../ui/form/FormError';
import { ProjectInput, ProjectUpdateInput } from '../../types/project';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uiTexts } from '../../config/texts';
import { validationMessages } from '../../config/validation';
import { iJsonSchema } from '../../lib/schemas/projectSchema';

interface ProjectFormProps {
  initialData?: Partial<ProjectInput>;
  isEditing?: boolean;
  onSubmit: (data: ProjectInput | ProjectUpdateInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  showIJsonField?: boolean;
  iJsonValue?: string;
  onIJsonChange?: (value: string) => void;
}

export function ProjectForm({
  initialData,
  isEditing = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showIJsonField = false,
  iJsonValue = '',
  onIJsonChange
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iJsonErrors, setIJsonErrors] = useState<Record<string, string>>({});
  const [isIJsonValid, setIsIJsonValid] = useState<boolean | null>(null);

  // Validar I-JSON en tiempo real cuando cambia
  useEffect(() => {
    if (showIJsonField && iJsonValue.trim()) {
      validateIJson(iJsonValue);
    } else {
      setIJsonErrors({});
      setIsIJsonValid(null);
    }
  }, [iJsonValue, showIJsonField]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = validationMessages.projectName.required;
    } else if (name.length < 3) {
      newErrors.name = validationMessages.projectName.tooShort;
    } else if (name.length > 100) {
      newErrors.name = validationMessages.projectName.tooLong;
    }

    if (!description.trim()) {
      newErrors.description = validationMessages.projectDescription.required;
    } else if (description.length < 10) {
      newErrors.description = validationMessages.projectDescription.tooShort;
    } else if (description.length > 1000) {
      newErrors.description = validationMessages.projectDescription.tooLong;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateIJson = (jsonString: string): boolean => {
    try {
      // Intentar parsear el JSON
      const parsedJson = JSON.parse(jsonString);

      // Validar con el esquema Zod
      const result = iJsonSchema.safeParse(parsedJson);

      if (!result.success) {
        // Convertir errores de Zod a un formato simple
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });

        setIJsonErrors(errors);
        setIsIJsonValid(false);
        return false;
      }

      setIJsonErrors({});
      setIsIJsonValid(true);
      return true;
    } catch (parseError) {
      setIJsonErrors({
        json: validationMessages.iJson.jsonInvalid
      });
      setIsIJsonValid(false);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Validar I-JSON si está presente
    if (showIJsonField && iJsonValue.trim() && !validateIJson(iJsonValue)) {
      return;
    }

    const data: ProjectInput = {
      name: name.trim(),
      description: description.trim()
    };

    await onSubmit(data);
  };

  const handleIJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (onIJsonChange) {
      onIJsonChange(value);
    }
  };

  const getIJsonStatusIcon = () => {
    if (isIJsonValid === null) return null;
    if (isIJsonValid) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  const getIJsonStatusText = () => {
    if (isIJsonValid === null) return '';
    if (isIJsonValid) {
      return 'I-JSON válido';
    }
    return 'I-JSON con errores';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FormGroup>
        <FormLabel htmlFor="name">{uiTexts.projectForm.nameLabel} *</FormLabel>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder={uiTexts.projectForm.namePlaceholder}
          error={errors.name || undefined}
          disabled={isSubmitting}
        />
        {errors.name && <FormError>{errors.name}</FormError>}
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description">{uiTexts.projectForm.descriptionLabel} *</FormLabel>
        <Textarea
          id="description"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          placeholder={uiTexts.projectForm.descriptionPlaceholder}
          rows={6}
          error={errors.description || undefined}
          disabled={isSubmitting}
        />
        {errors.description && <FormError>{errors.description}</FormError>}
        <p className="text-xs text-gray-500 mt-1">
          {validationMessages.characterCount(description.length, 1000)}
        </p>
      </FormGroup>

      {showIJsonField && (
        <FormGroup>
          <div className="flex items-center justify-between mb-2">
            <FormLabel htmlFor="iJson">I-JSON (opcional)</FormLabel>
            <div className="flex items-center gap-2 text-sm">
              {getIJsonStatusIcon()}
              <span className={isIJsonValid === true ? 'text-green-600' : isIJsonValid === false ? 'text-red-600' : 'text-gray-500'}>
                {getIJsonStatusText()}
              </span>
            </div>
          </div>
          <Textarea
            id="iJson"
            value={iJsonValue}
            onChange={handleIJsonChange}
            placeholder='{"url_fuente": "...", "portal_inmobiliario": "...", ...}'
            rows={10}
            error={iJsonErrors.json || undefined}
            disabled={isSubmitting}
            className="font-mono text-sm"
          />
          {iJsonErrors.json && <FormError>{iJsonErrors.json}</FormError>}
          
          {Object.keys(iJsonErrors).length > 1 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Errores de validación:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(iJsonErrors)
                  .filter(([key]) => key !== 'json')
                  .slice(0, 5)
                  .map(([key, message]) => (
                    <li key={key} className="flex gap-2">
                      <span className="font-medium">{key}:</span>
                      <span>{message}</span>
                    </li>
                  ))}
                {Object.keys(iJsonErrors).length > 6 && (
                  <li className="text-gray-600 italic">
                    ... y {Object.keys(iJsonErrors).length - 6} errores más
                  </li>
                )}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Pegue aquí el JSON del inmueble para validación automática
          </p>
        </FormGroup>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {uiTexts.buttons.cancel}
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting || (showIJsonField && iJsonValue.trim().length > 0 && isIJsonValid === false)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? uiTexts.actions.updating : uiTexts.actions.creating}
            </>
          ) : (
            isEditing ? uiTexts.projectForm.updateProject : uiTexts.projectForm.createProject
          )}
        </Button>
      </div>
    </form>
  );
}
