import { type SchemaTypeDefinition } from 'sanity';
import { schemaTypes } from '../../lib/sanity/schemas';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: schemaTypes as unknown as SchemaTypeDefinition[],
};
