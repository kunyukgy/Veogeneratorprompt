
import React, { useState, useEffect, useCallback } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoryboardSchema, storyboardSchema, initialData } from './types';
import useAutosave from './hooks/useAutosave';
import GlobalSettingsPanel from './components/GlobalSettingsPanel';
import ConsistencyEnginePanel from './components/ConsistencyEnginePanel';
import SceneBuilderPanel from './components/SceneBuilderPanel';
import JsonOutput from './components/JsonOutput';
import { Button } from './components/ui/Button';

const getInitialValues = (): StoryboardSchema => {
  try {
    const savedDraft = localStorage.getItem('veo_storyboard_draft');
    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);
      // Ensure the parsed data conforms to the schema.
      const validation = storyboardSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data;
      }
      // If validation fails, the data is corrupt or outdated. Discard it.
      console.warn("Could not validate storyboard draft from localStorage. Discarding.", validation.error.flatten());
      localStorage.removeItem('veo_storyboard_draft');
    }
  } catch (error) {
    console.error("Failed to load or parse draft from localStorage:", error);
    localStorage.removeItem('veo_storyboard_draft');
  }
  return initialData;
};

export default function App() {
  const [jsonData, setJsonData] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const form = useForm<StoryboardSchema>({
    resolver: zodResolver(storyboardSchema),
    defaultValues: getInitialValues(),
    mode: 'onChange',
  });

  const { control, watch, reset, getValues } = form;
  
  const allFields = watch();
  useAutosave('veo_storyboard_draft', allFields);

  const scenes = useWatch({ control, name: 'scenes' });

  useEffect(() => {
    const newTotalDuration = scenes.reduce((acc, scene) => acc + (Number(scene.duration_sec) || 0), 0);
    setTotalDuration(newTotalDuration);
  }, [scenes]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };
  
  const generateJson = useCallback(() => {
      const values = getValues();
      const result = storyboardSchema.safeParse(values);
      if (result.success) {
        setJsonData(JSON.stringify(result.data, null, 2));
        showToast('JSON Generated Successfully!');
      } else {
        const errorMessages = Object.entries(form.formState.errors).map(([key, error]: [string, any]) => {
            if(error.message) return `${key}: ${error.message}`;
            return null;
        }).filter(Boolean).join('\n');
        setJsonData(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
        showToast('Validation errors found. Check JSON preview for details.');
      }
  }, [getValues, form.formState.errors]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset? This will clear all data and remove the saved draft.')) {
      reset(initialData);
      localStorage.removeItem('veo_storyboard_draft');
      setJsonData('');
      showToast('Form has been reset.');
    }
  };
  
  const targetDuration = useWatch({ control, name: 'metadata.total_duration_sec' });
  const durationWarning = totalDuration > targetDuration;

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 font-sans">
        <div className="container mx-auto">
          <header className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Veo Storyboard Prompt Generator</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">Craft consistent and detailed video prompts with ease.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlobalSettingsPanel />
            <ConsistencyEnginePanel />
            <SceneBuilderPanel />
          </div>

          <div className="mt-6">
            <JsonOutput jsonData={jsonData} projectTitle={watch('metadata.project_title')} showToast={showToast} />
          </div>
          
          <footer className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-700 shadow-lg z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Total Scene Duration:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${durationWarning ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                {totalDuration}s / {targetDuration}s
              </span>
              {durationWarning && <span className="text-yellow-600 text-sm">Target duration exceeded.</span>}
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={generateJson} variant="primary">Generate JSON</Button>
              <Button onClick={handleReset} variant="danger">Reset Form</Button>
            </div>
          </footer>

          {toastMessage && (
            <div className="fixed top-5 right-5 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in-out">
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
