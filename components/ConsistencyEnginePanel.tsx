
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { StoryboardSchema } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Accordion, AccordionItem } from './ui/Accordion';

const ConsistencyEnginePanel: React.FC = () => {
  const { control, register, formState: { errors } } = useFormContext<StoryboardSchema>();

  const { fields: characters, append: appendCharacter, remove: removeCharacter } = useFieldArray({ control, name: 'characters' });
  const { fields: locations, append: appendLocation, remove: removeLocation } = useFieldArray({ control, name: 'locations' });

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
                <Button type="button" onClick={() => removeCharacter(index)} variant="danger">Remove Character</Button>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
        <Button type="button" onClick={() => appendCharacter({ id: `c${characters.length + 1}`, name: '', age_range: '', look: '', outfit_notes: '' })} className="mt-4">Add Character</Button>
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
                <Button type="button" onClick={() => removeLocation(index)} variant="danger">Remove Location</Button>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
        <Button type="button" onClick={() => appendLocation({ id: `l${locations.length + 1}`, name: '', lighting: '', notes: '' })} className="mt-4">Add Location</Button>
      </div>
    </div>
  );
};

export default ConsistencyEnginePanel;
