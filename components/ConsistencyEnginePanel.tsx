import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { StoryboardSchema } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Accordion, AccordionItem } from './ui/Accordion';

const ConsistencyEnginePanel: React.FC = () => {
  const { control, register, formState: { errors }, getValues, setValue } = useFormContext<StoryboardSchema>();

  const { fields: characters, append: appendCharacter, remove: removeCharacter } = useFieldArray({ control, name: 'characters' });
  const { fields: locations, append: appendLocation, remove: removeLocation } = useFieldArray({ control, name: 'locations' });

  const getNextId = (prefix: 'c' | 'l', items: { id?: string }[] | undefined) => {
    if (!items || items.length === 0) {
      return `${prefix}1`;
    }
    const maxId = items.reduce((max, item) => {
      if (typeof item.id === 'string' && item.id.startsWith(prefix)) {
        const num = parseInt(item.id.substring(prefix.length), 10);
        if (!isNaN(num) && num > max) {
          return num;
        }
      }
      return max;
    }, 0);
    return `${prefix}${maxId + 1}`;
  };

  const handleRemoveCharacter = (indexToRemove: number) => {
    const allValues = getValues();
    const characterToRemove = allValues.characters[indexToRemove];
    if (!characterToRemove) return;

    const usages: { sceneIndex: number; dialogIndex: number }[] = [];
    allValues.scenes.forEach((scene, sceneIndex) => {
      scene.dialog.forEach((d, dialogIndex) => {
        if (d.character_id === characterToRemove.id) {
          usages.push({ sceneIndex, dialogIndex });
        }
      });
    });

    if (usages.length > 0) {
      if (window.confirm(`This character is used in ${usages.length} dialog line(s). Removing the character will also clear them from these lines. Continue?`)) {
        const updatedScenes = allValues.scenes.map((scene, sceneIndex) => {
          const dialogIndicesToUpdate = usages
            .filter(u => u.sceneIndex === sceneIndex)
            .map(u => u.dialogIndex);

          if (dialogIndicesToUpdate.length > 0) {
            const newDialog = scene.dialog.map((d, dialogIndex) => {
              if (dialogIndicesToUpdate.includes(dialogIndex)) {
                return { ...d, character_id: '' };
              }
              return d;
            });
            return { ...scene, dialog: newDialog };
          }
          return scene;
        });
        setValue('scenes', updatedScenes, { shouldDirty: true });
        removeCharacter(indexToRemove);
      }
    } else {
      removeCharacter(indexToRemove);
    }
  };

  const handleRemoveLocation = (indexToRemove: number) => {
    const allValues = getValues();
    const locationToRemove = allValues.locations[indexToRemove];
    if (!locationToRemove) return;

    const sceneIndicesToUpdate: number[] = [];
    allValues.scenes.forEach((scene, sceneIndex) => {
      if (scene.location_id === locationToRemove.id) {
        sceneIndicesToUpdate.push(sceneIndex);
      }
    });

    if (sceneIndicesToUpdate.length > 0) {
      if (window.confirm(`This location is used in ${sceneIndicesToUpdate.length} scene(s). Removing the location will also clear it from these scenes. Continue?`)) {
        const updatedScenes = allValues.scenes.map((scene, sceneIndex) => {
          if (sceneIndicesToUpdate.includes(sceneIndex)) {
            return { ...scene, location_id: '' };
          }
          return scene;
        });
        setValue('scenes', updatedScenes, { shouldDirty: true });
        removeLocation(indexToRemove);
      }
    } else {
      removeLocation(indexToRemove);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-b-2 border-green-500 pb-2">Consistency Engine</h2>

      {/* Characters Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Characters</h3>
        {errors.characters?.root?.message && <p className="text-red-500 text-sm mb-2">{errors.characters.root.message}</p>}
        <Accordion type="multiple">
          {characters.map((field, index) => (
            <AccordionItem key={field.id} value={field.id} title={`Character ${index + 1} (${field.name || 'Unnamed'}) - ID: ${field.id}`}>
              <div className="space-y-4 p-4">
                <Input label="ID (auto)" {...register(`characters.${index}.id`)} readOnly className="bg-gray-200 dark:bg-gray-700" />
                <Input label="Name" {...register(`characters.${index}.name`)} error={errors.characters?.[index]?.name?.message} />
                <Input label="Age Range" {...register(`characters.${index}.age_range`)} error={errors.characters?.[index]?.age_range?.message} placeholder="e.g., 20-25" />
                <Textarea label="Look Description" {...register(`characters.${index}.look`)} rows={3} error={errors.characters?.[index]?.look?.message} placeholder="Physical appearance, style..." />
                <Textarea label="Outfit Notes" {...register(`characters.${index}.outfit_notes`)} rows={2} placeholder="Notes for outfit consistency..." />
                <Button type="button" onClick={() => handleRemoveCharacter(index)} variant="danger">Remove Character</Button>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
        <Button type="button" onClick={() => appendCharacter({ id: getNextId('c', getValues('characters')), name: '', age_range: '', look: '', outfit_notes: '' })} className="mt-4">Add Character</Button>
      </div>

      {/* Locations Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Locations</h3>
         {errors.locations?.root?.message && <p className="text-red-500 text-sm mb-2">{errors.locations.root.message}</p>}
        <Accordion type="multiple">
          {locations.map((field, index) => (
            <AccordionItem key={field.id} value={field.id} title={`Location ${index + 1} (${field.name}) - ID: ${field.id}`}>
              <div className="space-y-4 p-4">
                <Input label="ID (auto)" {...register(`locations.${index}.id`)} readOnly className="bg-gray-200 dark:bg-gray-700" />
                <Input label="Name" {...register(`locations.${index}.name`)} error={errors.locations?.[index]?.name?.message} />
                <Input label="Lighting" {...register(`locations.${index}.lighting`)} placeholder="e.g., Golden hour, moody indoor" />
                <Textarea label="Notes" {...register(`locations.${index}.notes`)} rows={2} placeholder="Key features, atmosphere..." />
                <Button type="button" onClick={() => handleRemoveLocation(index)} variant="danger">Remove Location</Button>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
        <Button type="button" onClick={() => appendLocation({ id: getNextId('l', getValues('locations')), name: '', lighting: '', notes: '' })} className="mt-4">Add Location</Button>
      </div>
    </div>
  );
};

export default ConsistencyEnginePanel;