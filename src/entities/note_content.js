"use strict";

const Entity = require('./entity');
const protectedSessionService = require('../services/protected_session');
const repository = require('../services/repository');
const dateUtils = require('../services/date_utils');
const noteFulltextService = require('../services/note_fulltext');

/**
 * This represents a Note which is a central object in the Trilium Notes project.
 *
 * @property {string} noteContentId - primary key
 * @property {string} noteId - reference to owning note
 * @property {boolean} isProtected - true if note content is protected
 * @property {blob} content - note content - e.g. HTML text for text notes, file payload for files
 * @property {string} utcDateCreated
 * @property {string} utcDateModified
 *
 * @extends Entity
 */
class NoteContent extends Entity {
    static get entityName() {
        return "note_contents";
    }

    static get primaryKeyName() {
        return "noteContentId";
    }

    static get hashedProperties() {
        return ["noteContentId", "noteId", "isProtected", "content"];
    }

    /**
     * @param row - object containing database row from "note_contents" table
     */
    constructor(row) {
        super(row);

        this.isProtected = !!this.isProtected;
        /* true if content (meaning any kind of potentially encrypted content) is either not encrypted
         * or encrypted, but with available protected session (so effectively decrypted) */
        this.isContentAvailable = true;

        // check if there's noteContentId, otherwise this is a new entity which wasn't encrypted yet
        if (this.isProtected && this.noteContentId) {
            this.isContentAvailable = protectedSessionService.isProtectedSessionAvailable();

            if (this.isContentAvailable) {
                protectedSessionService.decryptNoteContent(this);
            }
            else {
                // saving ciphertexts in case we do want to update protected note outside of protected session
                // (which is allowed)
                this.contentCipherText = this.content;
                this.content = "";
            }
        }
    }

    /**
     * @returns {Promise<Note>}
     */
    async getNote() {
        return await repository.getNote(this.noteId);
    }

    beforeSaving() {
        if (!this.utcDateCreated) {
            this.utcDateCreated = dateUtils.utcNowDateTime();
        }

        super.beforeSaving();

        if (this.isChanged) {
            this.utcDateModified = dateUtils.utcNowDateTime();
        }
    }

    // cannot be static!
    updatePojo(pojo) {
        if (pojo.isProtected) {
            if (this.isContentAvailable) {
                protectedSessionService.encryptNoteContent(pojo);
            }
            else {
                // updating protected note outside of protected session means we will keep original ciphertext
                pojo.content = pojo.contentCipherText;
            }
        }

        delete pojo.isContentAvailable;
        delete pojo.contentCipherText;
    }

    async afterSaving() {
        noteFulltextService.triggerNoteFulltextUpdate(this.noteId);
    }
}

module.exports = NoteContent;