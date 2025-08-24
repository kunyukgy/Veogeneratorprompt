
import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { StoryboardSchema } from '../types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Checkbox } from './ui/Checkbox';
import { LANGUAGES, TONES, ASPECT_RATIOS_V3 } from '../constants';

const GlobalSettingsPanel: React.FC = () => {
  const { register, control, setValue, formState: { errors } } = useFormContext<StoryboardSchema>();
  const model = useWatch({ control, name: 'model' });

  React.useEffect(() => {
    if (model === 'veo-2') {
      setValue('metadata.aspect_ratio', '9:16');
    }
  }, [model, setValue]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-blue-500 pb-2">Global Settings</h2>
      
      {/* Model Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input type="radio" {...register('model')} value="veo-2" className="form-radio text-blue-600" />
            <span className="ml-2">Veo-2</span>
          </label>
          <label className="flex items-center">
            <input type="radio" {...register('model')} value="veo-3" className="form-radio text-blue-600" />
            <span className="ml-2">Veo-3</span>
          </label>
        </div>
      </div>

      {/* Project Info */}
      <Input label="Project Title" {...register('metadata.project_title')} error={errors.metadata?.project_title?.message} />
      <Select label="Language" {...register('metadata.language')} options={LANGUAGES} error={errors.metadata?.language?.message} />
      
      {/* Aspect Ratio */}
      <Select 
        label="Global Aspect Ratio" 
        {...register('metadata.aspect_ratio')} 
        options={model === 'veo-3' ? ASPECT_RATIOS_V3.map(r => ({ value: r, label: r })) : [{ value: '9:16', label: '9:16' }]} 
        disabled={model === 'veo-2'}
        error={errors.metadata?.aspect_ratio?.message} 
      />
      
      <Input 
        label="Total Target Duration (seconds)" 
        type="number" 
        {...register('metadata.total_duration_sec', { valueAsNumber: true })} 
        error={errors.metadata?.total_duration_sec?.message} 
      />

      {/* Brand & Tone */}
      <Input label="Brand Tagline" {...register('metadata.brand.tagline')} error={errors.metadata?.brand?.tagline?.message} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Tone</label>
        <div className="grid grid-cols-2 gap-2">
          {TONES.map(tone => (
            <Checkbox key={tone} label={tone} value={tone} {...register('metadata.brand.tone')} />
          ))}
        </div>
      </div>
      
      <Textarea label="Global Prompt" {...register('global_prompt')} rows={4} placeholder="Overall context, goals, and core message of the video..." />
    </div>
  );
};

export default GlobalSettingsPanel;
