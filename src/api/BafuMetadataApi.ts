import {
  ElementModel,
  LinkModel,
  ElementIri,
  ElementTypeIri,
  LinkTypeIri,
  PropertyTypeIri,
  LinkDirection,
  MetadataApi,
  ValidationApi,
  ValidationEvent,
  ElementError,
  LinkError,
  DirectedLinkType,
  CancellationToken,
} from 'graph-explorer';

const OWL_PREFIX = 'http://www.w3.org/2002/07/owl#';
const TABLE_PREFIX = 'http://schema.table.org/';
const EA_PREFIX = 'http://example.org/ea/';
const RDFS_PREFIX = 'http://www.w3.org/2000/01/rdf-schema#';

const owl = {
  class: (OWL_PREFIX + 'Class') as ElementTypeIri,
  objectProperty: (OWL_PREFIX + 'ObjectProperty') as ElementTypeIri,
  domain: (OWL_PREFIX + 'domain') as LinkTypeIri,
  range: (OWL_PREFIX + 'range') as LinkTypeIri,
};

const table = {
  column: (TABLE_PREFIX + 'Column') as ElementTypeIri,
};

const ea = {
  attribute: (EA_PREFIX + 'Attribute') as ElementTypeIri,
  assignment: (EA_PREFIX + 'assignment') as LinkTypeIri,
};

const rdfs = {
  subClassOf: (RDFS_PREFIX + 'subClassOf') as LinkTypeIri,
  subPropertyOf: (RDFS_PREFIX + 'subPropertyOf') as LinkTypeIri,
};

const linkTypes = [
  {
    "source": ea.attribute,
    "target": table.column,
    "link":ea.assignment
  },
  {
    "source": table.column,
    "target": ea.attribute,
    "link":ea.assignment
  }
]


function hasType(model: ElementModel, type: ElementTypeIri) {
  return Boolean(model.types.find((t) => t === type));
}

const SIMULATED_DELAY = 500; /* ms */

export class BafuMetadataApi implements MetadataApi {
  async canDropOnCanvas(
    source: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    const elementTypes = await this.typesOfElementsDraggedFrom(source, ct);
    CancellationToken.throwIfAborted(ct);
    return elementTypes.length > 0;
  }

  async canDropOnElement(
    source: ElementModel,
    target: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    const linkTypes = await this.possibleLinkTypes(source, target, ct);
    CancellationToken.throwIfAborted(ct);
    return linkTypes.length > 0;
  }

  async possibleLinkTypes(
    source: ElementModel,
    target: ElementModel,
    ct: CancellationToken
  ): Promise<DirectedLinkType[]> {
    let mappedLinkTypes = []
    linkTypes.forEach( linkType => {
      if(hasType(source, linkType.source) && hasType(target, linkType.target)){
        mappedLinkTypes = mappedLinkTypes.concat(mapLinkTypes([linkType.link]))
        mappedLinkTypes = mappedLinkTypes.concat(mapLinkTypes([linkType.link], LinkDirection.in))
      }
        
    })
    return mappedLinkTypes;
    
    function mapLinkTypes(
      types: LinkTypeIri[],
      direction: LinkDirection = LinkDirection.out
    ): DirectedLinkType[] {
      return types.map((linkTypeIri) => ({ linkTypeIri, direction }));
    }
  }

  async typesOfElementsDraggedFrom(
    source: ElementModel,
    ct: CancellationToken
  ): Promise<ElementTypeIri[]> {
    await delay(SIMULATED_DELAY, ct);
    return hasType(source, owl.class)
      ? [owl.class]
      : hasType(source, owl.objectProperty)
      ? [owl.class, owl.objectProperty]
      : [];
  }

  async propertiesForType(
    type: ElementTypeIri,
    ct: CancellationToken
  ): Promise<PropertyTypeIri[]> {
    //await delay(SIMULATED_DELAY, ct);
    return [];
  }

  async canDeleteElement(
    element: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    await delay(SIMULATED_DELAY, ct);
    return true;
  }
  /**
   * This function is called with all types returned from classTree and should return all type you want to be able to create
   * 
   * @param types 
   * @param ct 
   * @returns 
   */
  async filterConstructibleTypes(
    types: ReadonlySet<ElementTypeIri>,
    ct: CancellationToken
  ): Promise<ReadonlySet<ElementTypeIri>> {
    //await delay(SIMULATED_DELAY, ct);
    const result = new Set<ElementTypeIri>();
    /*types.forEach((type) => {
      if (type.length % 2 === 0) {
        result.add(type);
      }
    });*/
    return result;
  }

  async canEditElement(
    element: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    return true;
  }

  async canLinkElement(
    element: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    return true;
  }

  async canDeleteLink(
    link: LinkModel,
    source: ElementModel,
    target: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    return true;
  }

  async canEditLink(
    link: LinkModel,
    source: ElementModel,
    target: ElementModel,
    ct: CancellationToken
  ): Promise<boolean> {
    return true;
  }

  async generateNewElement(
    types: ReadonlyArray<ElementTypeIri>,
    ct: CancellationToken
  ): Promise<ElementModel> {
    await delay(SIMULATED_DELAY, ct);
    const random32BitDigits = Math.floor((1 + Math.random()) * 0x100000000)
      .toString(16)
      .substring(1);
    return {
      id: `${types[0]}_${random32BitDigits}` as ElementIri,
      types: [...types],
      label: { values: [{ value: 'New Entity', language: '' }] },
      properties: {},
    };
  }
}

export class BafuValidationApi implements ValidationApi {
  async validate(
    event: ValidationEvent
  ): Promise<Array<ElementError | LinkError>> {
    const errors: Array<ElementError | LinkError> = [];
    if (event.target.types.indexOf(owl.class) >= 0) {
      event.state.links.forEach((e) => {
        if (!e.before && e.after.sourceId === event.target.id) {
          errors.push({
            type: 'link',
            target: e.after,
            message: 'Cannot add any new link from a Class',
          });
          const linkType = event.model.createLinkType(e.after.linkTypeId);
          errors.push({
            type: 'element',
            target: event.target.id,
            message: `Cannot create <${linkType.id}> link from a Class`,
          });
        }
      });
    }

    await delay(SIMULATED_DELAY, event.cancellation);
    return errors;
  }
}

async function delay(amountMs: number, ct: CancellationToken) {
  CancellationToken.throwIfAborted(ct);
  await waitTimeout(amountMs);
  CancellationToken.throwIfAborted(ct);
}

function waitTimeout(amountMs: number): Promise<void> {
  if (amountMs === 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, amountMs));
}
