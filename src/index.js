var React = require('react');
var ReactDOM = require('react-dom');

import { DefaultTemplate } from './templates/defaulttemplate'

import {StoreChanges} from './api/BafuStoreApi'

var GraphExplorer = require('graph-explorer')

import {
    BafuMetadataApi,
    BafuValidationApi,
  } from './api/BafuMetadataApi';

import '../css/explorer.css'

const N3Parser = require('rdf-parser-n3');
const RdfXmlParser = require('rdf-parser-rdfxml');
const JsonLdParser = require('rdf-parser-jsonld');

const data = require('./flux-data.ttl');

function onWorkspaceMounted(workspace) {
    if (!workspace) { return; }

    const model = workspace.getModel();


    model.importLayout({
        dataProvider: new GraphExplorer.RDFDataProvider({
            data: [
                {
                    content: data,
                    type: 'text/turtle',
                    fileName: 'testData.ttl',
                },
            ],
            acceptBlankNodes: false,
            dataFetching: false,
            parsers: {
                'application/rdf+xml': new RdfXmlParser(),
                'application/ld+json': new JsonLdParser(),
                'text/turtle': new N3Parser(),
            },
        }),

    });


    let url = new URL(window.location.href);
    let resource = url.searchParams.get("resource");
    if (resource != null) {
        let elm = model.dataProvider.elementInfo({ elementIds: [resource] });
        elm.then(function (arg) {
            model.createElement(arg[resource])
            workspace.forceLayout();
        });
    }
    let resources = url.searchParams.get("resources");
    if (resources != null) {


        let elm = model.dataProvider.elementInfo({ elementIds: resources.split(';') });
        elm.then(function (arg) {
            let elmIds = []
            resources.split(';').forEach(function (item) {
                let node = model.createElement(arg[item])
                elmIds[item] = node.id;
                workspace.forceLayout();
            })
            return elmIds
        }).then(function (elmIds) {
            /* now that we have the resources, add the links */

            let lnk = model.dataProvider.linksInfo({ elementIds: resources.split(';') })
            lnk.then(function (arg) {
                arg.forEach(function (link) {
                    let newLink = new GraphExplorer.Link({ typeId: link.linkTypeId, sourceId: elmIds[link.sourceId], targetId: elmIds[link.targetId] })

                    model.addLink(newLink)
                    workspace.forceLayout();
                })
            })
        });




    }
}

const props = {
    ref: onWorkspaceMounted,
    elementTemplateResolver: templateResolver,
    metadataApi: new BafuMetadataApi(),
    languages: [
        { code: 'en', label: 'English' },
    ],
    language: 'en',
    onPersistChanges: StoreChanges
};

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(React.createElement(GraphExplorer.Workspace, props), document.getElementById('onto-container'))
});

class CustomElementTemplate extends React.Component {
    render() {
        return React.createElement('div', null, `Hello World`);
    }
}

function templateResolver(types) {
    /*if (types.indexOf('http://www.w3.org/2003/01/geo/wgs84_pos#Point') !== -1) {
        return TestTemplate;
    } else {*/
    return DefaultTemplate
    //}
}
