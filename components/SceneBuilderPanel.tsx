
import React from 'react';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { StoryboardSchema } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Accordion, AccordionItem } from './ui/Accordion';
import { SHOT_TYPES, ASPECT_RATIOS_V3 } from '../constants';

const ShotBuilder: React.FC<{ sceneIndex: number }> = ({ sceneIndex }) => {
  const { control, register, formState: { errors } } = useFormContext<StoryboardSchema>();
  const { fields, append, remove } = useFieldArray({ control, name: `scenes.${sceneIndex}.shots` });
  
  return (
    <div className="space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
      <h4 className="font-semibold text-md">Shots</h4>
       {errors.scenes?.[sceneIndex]?.shots?.root?.message && <p className="text-red-500 text-sm">{errors.scenes?.[sceneIndex]?.shots?.root?.message}</p>}
      {fields.map((shot, shotIndex) => (
        <div key={shot.id} className="p-3 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label={`Shot ${shotIndex + 1} Type`} {...register(`scenes.${sceneIndex}.shots.${shotIndex}.type`)} options={SHOT_TYPES.map(s => ({ value: s, label: s }))} error={errors.scenes?.[sceneIndex]?.shots?.[shotIndex]?.type?.message} />
            <Input label="Camera Movement" {...register(`scenes.${sceneIndex}.shots.${shotIndex}.camera`)} placeholder="e.g., handheld, push-in" />
            <Textarea label="Action" {...register(`scenes.${sceneIndex}.shots.${shotIndex}.action`)} rows={2} className="md:col-span-2" error={errors.scenes?.[sceneIndex]?.shots?.[shotIndex]?.action?.message} />
          </div>
          <Button type="button" onClick={() => remove(shotIndex)} variant="danger" size="sm" className="mt-2">Remove Shot</Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ type: 'medium', action: '' })}>Add Shot</Button>
    </div>
  );
};

const DialogBuilder: React.FC<{ sceneIndex: number }> = ({ sceneIndex }) => {
  const { control, register, formState: { errors } } = useFormContext<StoryboardSchema>();
  const characters = useWatch({ control, name: 'characters' });
  const useVO = useWatch({ control, name: `scenes.${sceneIndex}.use_vo` });
  const { fields, append, remove } = useFieldArray({ control, name: `scenes.${sceneIndex}.dialog` });
  
  return (
    <div className="space-y-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600 mt-4">
      <h4 className="font-semibold text-md">{useVO ? 'Voice Over' : 'Dialog'}</h4>
      {errors.scenes?.[sceneIndex]?.dialog?.root?.message && <p className="text-red-500 text-sm">{errors.scenes?.[sceneIndex]?.dialog?.root?.message}</p>}
      {fields.map((dialog, dialogIndex) => (
        <div key={dialog.id} className="p-3 border rounded-md border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <Select label="Character" {...register(`scenes.${sceneIndex}.dialog.${dialogIndex}.character_id`)} options={characters.map(c => ({ value: c.id, label: `${c.name || 'Unnamed'} (${c.id})` }))} error={errors.scenes?.[sceneIndex]?.dialog?.[dialogIndex]?.character_id?.message} />
          <Textarea label="Line" {...register(`scenes.${sceneIndex}.dialog.${dialogIndex}.line`)} rows={2} className="mt-2" error={errors.scenes?.[sceneIndex]?.dialog?.[dialogIndex]?.line?.message} />
          <input type="hidden" {...register(`scenes.${sceneIndex}.dialog.${dialogIndex}.mode`)} value={useVO ? 'vo' : 'dialog'} />
          <Button type="button" onClick={() => remove(dialogIndex)} variant="danger" size="sm" className="mt-2">Remove Line</Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ character_id: characters[0]?.id || '', line: '', mode: useVO ? 'vo' : 'dialog' })}>Add Line</Button>
    </div>
  );
};


const SceneBuilderPanel: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<StoryboardSchema>();
  const { fields, append, remove } = useFieldArray({ control, name: 'scenes' });
  
  const locations = useWatch({ control, name: 'locations' });
  const model = useWatch({ control, name: 'model' });
  const globalRatio = useWatch({ control, name: 'metadata.aspect_ratio' });

  const ratioOptions = model === 'veo-3' 
    ? [{ value: 'inherit', label: `Inherit (${globalRatio})` }, ...ASPECT_RATIOS_V3.map(r => ({ value: r, label: r }))] 
    : [{ value: 'inherit', label: `Inherit (9:16)` }, { value: '9:16', label: '9:16' }];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-purple-500 pb-2">Scene & Dialog Builder</h2>
        <Button type="button" onClick={() => append({ id: `s${fields.length + 1}`, title: '', duration_sec: 10, location_id: '', ratio: 'inherit', shots: [{ type: 'medium', action: '' }], dialog: [{ character_id: '', line: '', mode: 'dialog' }], use_vo: false })}>Add Scene</Button>
      </div>
      {errors.scenes?.root?.message && <p className="text-red-500 text-sm mb-2">{errors.scenes.root.message}</p>}
      <Accordion type="single" collapsible className="w-full">
        {fields.map((scene, index) => (
          <AccordionItem key={scene.id} value={scene.id} title={`Scene ${index + 1}: ${scene.title || 'Untitled'} - ID: ${scene.id}`}>
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Scene Title" {...register(`scenes.${index}.title`)} placeholder="e.g., The Opening" />
                <Input label="Duration (sec)" type="number" {...register(`scenes.${index}.duration_sec`, { valueAsNumber: true })} error={errors.scenes?.[index]?.duration_sec?.message} />
                <Select label="Location" {...register(`scenes.${index}.location_id`)} options={locations.map(l => ({ value: l.id, label: `${l.name} (${l.id})` }))} error={errors.scenes?.[index]?.location_id?.message} />
                <Select label="Aspect Ratio" {...register(`scenes.${index}.ratio`)} options={ratioOptions} error={errors.scenes?.[index]?.ratio?.message} disabled={model === 'veo-2'} />
              </div>
              
              <label className="flex items-center mt-4">
                <input type="checkbox" {...register(`scenes.${index}.use_vo`)} className="form-checkbox text-purple-600" />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Use Voice Over instead of Dialog for this scene</span>
              </label>

              <ShotBuilder sceneIndex={index} />
              <DialogBuilder sceneIndex={index} />
              
              <Button type="button" onClick={() => remove(index)} variant="danger" className="mt-4">Remove Scene</Button>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SceneBuilderPanel;
