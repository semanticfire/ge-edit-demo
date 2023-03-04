import { Workspace } from "graph-explorer";

var SparqlGenerator = require('sparqljs').Generator;

/**
 * Picks up the data from the workspace and generates insert queries from it.
 * @param workspace 
 */

export function StoreChanges(workspace: Workspace) {
    const state = workspace.getEditor().authoringState;
    // tslint:disable-next-line:no-console
    let insertStructure = {
        "type": "update",
        "updates": [{
            "updateType": "insert",
            "insert": [
                {
                    "type": "bgp",
                    "triples": [
                    ]
                }
            ]
        }]
    }
    state.elements.forEach(x => {
        console.log(x);
    })
    state.links.forEach(x => {
        if (x.deleted) {
            console.log("need to remove triple")
            console.log(x.after.sourceId + " " + x.after.linkTypeId + " " + x.after.targetId)
        } else {
            insertStructure.updates[0].insert[0].triples.push({
                "subject": {
                  "termType": "NamedNode",
                  "value": x.after.sourceId
                },
                "predicate": {
                  "termType": "NamedNode",
                  "value": x.after.linkTypeId
                },
                "object": {
                    "termType": "NamedNode",
                    "value": x.after.targetId
                }
              })
        }
    })

    let parser = new SparqlGenerator()
    let updateQuery = parser.stringify(insertStructure)
    console.log(updateQuery)

}