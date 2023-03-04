import * as React from 'react';
import { ElementIri, ElementModel, Dictionary, LocalizedString, Property, isIriProperty, isLiteralProperty  } from 'graph-explorer/src/graph-explorer/data/model';

import { isEncodedBlank } from 'graph-explorer/src/graph-explorer/data/sparql/blankNodes';

    
const CLASS_NAME = 'graph-explorer-standard-template';

/* Default Template from Ontodia */

export type PropArray = Array<{
    id: string;
    name: string;
    property: Property;
}>;


export interface TemplateProps {
    elementId: string;
    data: ElementModel;
    iri: ElementIri;
    types: string;
    label: string;
    color: any;
    iconUrl: string;
    imgUrl?: string;
    isExpanded?: boolean;
    propsAsList?: PropArray;
    props?: Dictionary<Property>;
}

export class DefaultTemplate extends React.Component<TemplateProps, {}> {
    render() {
        return (
           this.renderTemplate()
        );
    }

    private renderTemplate() {
        const {color, types, isExpanded, iri, propsAsList} = this.props;
        const label = this.getLabel();

        
        /*return (
            <div className={CLASS_NAME}>
                <div className={`${CLASS_NAME}__main`} style={{backgroundColor: color, borderColor: color}}>
                    <div className={`${CLASS_NAME}__body`} style={{borderLeftColor: color}}>
                        <div className={`${CLASS_NAME}__body-horizontal`}>
                            {this.renderThumbnail()}
                            <div className={`${CLASS_NAME}__body-content`}>
                                <div title={types} className={`${CLASS_NAME}__type`}>
                                    <div className={`${CLASS_NAME}__type-value`}>{this.getTypesLabel()}</div>
                                </div>
                                <div className={`${CLASS_NAME}__label`} title={label}>{label}</div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                {isExpanded ? (
                    <div className={`${CLASS_NAME}__dropdown`} style={{borderColor: color}}>
                        {this.renderPhoto()}
                        <div className={`${CLASS_NAME}__dropdown-content`}>
                            {this.renderIri()}
                            {this.renderProperties(propsAsList)}
                            
                        </div>
                    </div>
                ) : null}
            </div>
        );*/
        return (
            <div className=''>
                <div className='card card-primary card-outline m-0 elevation-1' style={{ borderColor: color}}>
                    
                    <div className='card-body p-1'>
                        <div className={`${CLASS_NAME}__body-horizontal`}>
                            {this.renderThumbnail()}
                            <div className={`${CLASS_NAME}__body-content`}>
                                <div title={types} className={`${CLASS_NAME}__type`}>
                                    <div className={`${CLASS_NAME}__type-value`}>{this.getTypesLabel()}</div>
                                </div>
                                <div className={`${CLASS_NAME}__label`} title={label}>{label}</div>
                            </div>
                        </div>
                        
                    </div>
                
                    {isExpanded ? (
                        <div className='card-body p-1' style={{ borderTop: '1px solid', borderColor: color}}>
                            {this.renderPhoto()}
                            <div className={`${CLASS_NAME}__dropdown-content`}>
                                {this.renderIri()}
                                {this.renderProperties(propsAsList)}
                                
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    private renderIri() {
        const {iri} = this.props;
        const finalIri =  iri;
        let dsname = null
        dsname = this.getProperty(this.props.props,"urn:fg:dslabel")
        return (
            <div>
                <div >
                    <div >
                        {dsname !== undefined ? <i className='fa fa-database' title={dsname}></i> : <i/> } IRI:
                    </div>
                    <div >
                        {isEncodedBlank(finalIri)
                            ? <span>(blank node)</span>
                            : <a href={finalIri}
                                title={finalIri}
                                data-iri-click-intent='openEntityIri'>
                                {finalIri}
                            </a>}
                    </div>
                </div>
                <hr  />
            </div>
        );
    }
   
    private renderProperties(propsAsList: PropArray) {
        if (!propsAsList.length) {
            return <div>no properties</div>;
        }

        return (
            <dl>
                {propsAsList.map(({name, id, property}) => {
                    const propertyValues = this.getPropertyValues(property);
                    if(id === 'urn:fg:dslabel')
                        return
                    return <div key={id}>
                        <dt  title={`${name} (${id})`}>
                            {name}
                        </dt>
                        <dd >
                            {propertyValues.map((text, index) => (
                                <div key={index} title={text}>
                                    {text}
                                </div>
                            ))}
                        </dd>
                    </div>;
                })}
            </dl>
        );
    }

    private renderPhoto() {
        const {color, imgUrl} = this.props;

        if (!imgUrl) { return null; }

        return (
            <div className={`${CLASS_NAME}__photo`} style={{borderColor: color}}>
                <img src={imgUrl} className={`${CLASS_NAME}__photo-image`} />
            </div>
        );
    }

    private renderThumbnail() {
        const {color, imgUrl, iconUrl} = this.props;

        if (imgUrl) {
            return (
                <div className={`${CLASS_NAME}__thumbnail`} aria-hidden='true'>
                    <img src={imgUrl} className={`${CLASS_NAME}__thumbnail-image`} />
                </div>
            );
        } else if (iconUrl) {
            return (
                <div className={`${CLASS_NAME}__thumbnail`} aria-hidden='true' style={{color}}>
                    <img src={iconUrl} className={`${CLASS_NAME}__thumbnail-icon`} />
                </div>
            );
        }

        const typeLabel = this.getTypesLabel();
        return (
            <div className={`${CLASS_NAME}__thumbnail`} aria-hidden='true' style={{color}}>
               {typeLabel.length > 0 ? typeLabel.charAt(0).toUpperCase() : '✳'}
            </div>
        );
    }

    protected getTypesLabel(): string {
        return this.props.types;
    }

    private getLabel() {
        const {label, props} = this.props;
        return label;
    }

    private getProperty(props: Dictionary<Property>, id: string) {
        if (props && props[id]) {
            return this.getPropertyValues(props[id]).join(', ');
        } else {
            return undefined;
        }
    }
    
    private getPropertyValues(property: Property): string[] {
        if (isIriProperty(property)) {
            return property.values.map(({value}) => value);
        } else if (isLiteralProperty(property)) {
            return property.values.map(function(value) {
                return value.value;
            })
        }
        return [];
    }

}

interface PinnedProperties {
    [propertyId: string]: boolean;
}
