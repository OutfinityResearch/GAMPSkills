import { GampRSPCore } from './gamp-rsp/GampRSPCore.mjs';
import { DocumentManager } from './gamp-rsp/DocumentManager.mjs';
import { DSManager } from './gamp-rsp/DSManager.mjs';
import { ReportingManager } from './gamp-rsp/ReportingManager.mjs';

class GampRSPFacade {
    constructor() {
        this.core = new GampRSPCore();
        this.docManager = new DocumentManager(this.core);
        this.dsManager = new DSManager(this.core, this.docManager);
        this.reportingManager = new ReportingManager(this.core, this.docManager);

        // Bind all public methods from managers to this facade
        // so they can be called directly, e.g., gampRSP.createURS(...)
        this.bindMethods(this.core, [
            'configure', 'getSpecsDirectory', 'getDSDir', 'getMockDir',
            'getDocsDir', 'getMatrixPath', 'getIgnorePath', 'readIgnoreList',
            'addIgnoreEntries', 'readCache', 'writeCache', 'resolveDSFilePath'
        ]);
        this.bindMethods(this.docManager, [
            'createURS', 'updateURS', 'retireURS', 'createFS', 'updateFS',
            'obsoleteFS', 'createNFS', 'updateNFS', 'obsoleteNFS',
            'readDocument', 'writeDocument', 'linkRequirementToDS'
        ]);
        this.bindMethods(this.dsManager, [
            'createDS', 'updateDS', 'listDSIds', 'createTest', 'updateTest',
            'deleteTest', 'describeFile', 'findDSByTest', 'nextTestId',
            'getDSFilePath' // Added getDSFilePath
        ]);
        this.bindMethods(this.reportingManager, [
            'refreshMatrix', 'generateHtmlDocs', 'loadSpecs'
        ]);
    }

    bindMethods(source, methods) {
        methods.forEach(methodName => {
            if (typeof source[methodName] === 'function') {
                this[methodName] = source[methodName].bind(source);
            }
        });
    }

    // The 'action' entry point for CodeSpecsSkillsSubsystem
    async action(args) {
        const { method, params = [] } = args;

        if (typeof this[method] === 'function') {
            // Await the result of the method call
            const result = await this[method](...params);
            return result;
        } else {
            throw new Error(`Method "${method}" not found or not exposed.`);
        }
    }
}

const gampRSP = new GampRSPFacade();
export { gampRSP }; // Export named for easier testing and direct access

// For the csskill action
export async function action(args) {
    return await gampRSP.action(args);
}
