import utils from "./utils.js";
import server from "./server.js";
import protectedSessionHolder from "./protected_session_holder.js";
import noteDetailService from "./note_detail.js";

const $component = $('#note-detail-file');

const $fileNoteId = $("#file-note-id");
const $fileName = $("#file-filename");
const $fileType = $("#file-filetype");
const $fileSize = $("#file-filesize");
const $previewRow = $("#file-preview-row");
const $previewContent = $("#file-preview-content");
const $downloadButton = $("#file-download");
const $openButton = $("#file-open");

async function show() {
    const activeNote = noteDetailService.getActiveNote();

    const attributes = await server.get('notes/' + activeNote.noteId + '/attributes');
    const attributeMap = utils.toObject(attributes, l => [l.name, l.value]);

    $component.show();

    $fileNoteId.text(activeNote.noteId);
    $fileName.text(attributeMap.originalFileName || "?");
    $fileSize.text((attributeMap.fileSize || "?") + " bytes");
    $fileType.text(activeNote.mime);

    if (activeNote.noteContent && activeNote.noteContent.content) {
        $previewRow.show();
        $previewContent.text(activeNote.noteContent.content);
    }
    else {
        $previewRow.hide();
    }
}

$downloadButton.click(() => utils.download(getFileUrl()));

$openButton.click(() => {
    if (utils.isElectron()) {
        const open = require("open");

        open(getFileUrl());
    }
    else {
        window.location.href = getFileUrl();
    }
});

function getFileUrl() {
    // electron needs absolute URL so we extract current host, port, protocol
    return utils.getHost() + "/api/notes/" + noteDetailService.getActiveNoteId();
}

export default {
    show,
    getContent: () => null,
    focus: () => null,
    onNoteChange: () => null,
    cleanup: () => null,
    scrollToTop: () => null
}