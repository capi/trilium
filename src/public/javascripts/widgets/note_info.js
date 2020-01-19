import StandardWidget from "./standard_widget.js";

const TPL = `
<table class="note-info-table" style="table-layout: fixed; width: 100%;">
    <tr>
        <th nowrap>Note ID:</th>
        <td nowrap colspan="3" class="note-info-note-id"></td>
    </tr>
    <tr>
        <th nowrap>Created:</th>
        <td nowrap colspan="3" style="overflow: hidden; text-overflow: ellipsis;" class="note-info-date-created"></td>
    </tr>
    <tr>
        <th nowrap>Modified:</th>
        <td nowrap colspan="3" style="overflow: hidden; text-overflow: ellipsis;" class="note-info-date-modified"></td>
    </tr>
    <tr>
        <th>Type:</th>
        <td class="note-info-type"></td>
        
        <th>MIME:</th>
        <td class="note-info-mime"></td>
    </tr>
</table>
`;

class NoteInfoWidget extends StandardWidget {
    getWidgetTitle() { return "Note info"; }

    doRenderBody() {
        this.$body.html(TPL);
    }

    refreshWithNote(note) {
        const $noteId = this.$body.find(".note-info-note-id");
        const $dateCreated = this.$body.find(".note-info-date-created");
        const $dateModified = this.$body.find(".note-info-date-modified");
        const $type = this.$body.find(".note-info-type");
        const $mime = this.$body.find(".note-info-mime");

        $noteId.text(note.noteId);
        $dateCreated
            .text(note.dateCreated)
            .attr("title", note.dateCreated);

        $dateModified
            .text(note.dateModified)
            .attr("title", note.dateCreated);

        $type.text(note.type);

        $mime
            .text(note.mime)
            .attr("title", note.mime);
    }

    // this is interesting for this widget since dateModified had to change after update
    noteChangesSavedListener({noteId}) {
        const note = this.tabContext.note;

        if (note && note.noteId === noteId) {
            this.refreshWithNote(note);
        }
    }

    syncDataListener({data}) {
        if (data.find(sd => sd.entityName === 'notes' && sd.entityId === this.tabContext.note.noteId)) {
            this.refresh();
        }
    }
}

export default NoteInfoWidget;