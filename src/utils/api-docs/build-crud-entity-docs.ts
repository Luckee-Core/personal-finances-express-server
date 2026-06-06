import type { ApiDocsEndpoint } from '../../services/api-docs/types';

const successEnvelope = <T>(data: T) => ({ success: true, data });
const errorEnvelope = (error: string) => ({ success: false, error });

export type BuildCrudEntityDocsInput = {
  entityName: string;
  basePath: string;
  entityExample: unknown;
  createBodyExample?: unknown;
  patchBodyExample?: unknown;
  includeGetById?: boolean;
  includeMutations?: boolean;
};

/**
 * Builds standard CRUD endpoint docs for a catalog entity.
 */
export const buildCrudEntityDocs = (input: BuildCrudEntityDocsInput): ApiDocsEndpoint[] => {
  const {
    entityName,
    basePath,
    entityExample,
    createBodyExample,
    patchBodyExample,
    includeGetById = false,
    includeMutations = true,
  } = input;

  const endpoints: ApiDocsEndpoint[] = [
    {
      method: 'GET',
      path: basePath,
      summary: `List ${entityName}`,
      responses: [
        {
          status: 200,
          description: 'Array of entities',
          example: successEnvelope([entityExample]),
        },
        {
          status: 500,
          description: 'Server error',
          example: errorEnvelope('Internal server error'),
        },
      ],
    },
  ];

  if (includeGetById) {
    endpoints.push({
      method: 'GET',
      path: `${basePath}/:id`,
      summary: `Get ${entityName} by id`,
      responses: [
        {
          status: 200,
          description: 'Single entity',
          example: successEnvelope(entityExample),
        },
        {
          status: 400,
          description: 'Invalid id',
          example: errorEnvelope('Invalid id'),
        },
        {
          status: 500,
          description: 'Server error',
          example: errorEnvelope('Internal server error'),
        },
      ],
    });
  }

  if (!includeMutations) {
    return endpoints;
  }

  if (createBodyExample !== undefined) {
    endpoints.push({
      method: 'POST',
      path: basePath,
      summary: `Create ${entityName}`,
      requestBody: {
        contentType: 'application/json',
        example: createBodyExample,
      },
      responses: [
        {
          status: 200,
          description: 'Created entity',
          example: successEnvelope(entityExample),
        },
        {
          status: 400,
          description: 'Validation error',
          example: errorEnvelope('name is required'),
        },
        {
          status: 500,
          description: 'Server error',
          example: errorEnvelope('Internal server error'),
        },
      ],
    });
  }

  endpoints.push(
    {
      method: 'PATCH',
      path: `${basePath}/:id`,
      summary: `Update ${entityName}`,
      requestBody: {
        contentType: 'application/json',
        example: patchBodyExample ?? { name: 'Updated name' },
      },
      responses: [
        {
          status: 200,
          description: 'Updated entity',
          example: successEnvelope(entityExample),
        },
        {
          status: 400,
          description: 'Invalid id or body',
          example: errorEnvelope('Invalid id'),
        },
        {
          status: 500,
          description: 'Server error',
          example: errorEnvelope('Internal server error'),
        },
      ],
    },
    {
      method: 'DELETE',
      path: `${basePath}/:id`,
      summary: `Delete ${entityName}`,
      responses: [
        {
          status: 200,
          description: 'Deleted entity',
          example: successEnvelope(entityExample),
        },
        {
          status: 400,
          description: 'Invalid id',
          example: errorEnvelope('Invalid id'),
        },
        {
          status: 500,
          description: 'Server error',
          example: errorEnvelope('Internal server error'),
        },
      ],
    },
  );

  return endpoints;
};

/**
 * Builds read-only list + get-by-id docs for audit tables.
 */
export const buildReadOnlyAuditDocs = (
  entityName: string,
  basePath: string,
  entityExample: unknown,
): ApiDocsEndpoint[] => {
  return buildCrudEntityDocs({
    entityName,
    basePath,
    entityExample,
    includeGetById: true,
    includeMutations: false,
  });
};
