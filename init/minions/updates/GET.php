<div class="adminContentCatch headerOnPage" id="salt_minionUpdateContent">
    <div id="update_wait" class="loading_place"></div>
    <div class="hide_til_load" context="minion_update_list">
        <div class="salt_pageBlock">
            <div class="salt_pageBlockItem two-thirds">
                <div class="adminNewObjectToolbar">
                    <input placeholder="Filter packages" type="text" class="objectListFilter" list_id="minion_update_list">
                    <label>
                        <input minion="<?= $minion ?>" type="checkbox" id="salt_minionUpdate_selectAll">
                        Select All
                    </label>
                </div>
                <ul class="objectList formInputList flexGrid whole condensed" id="minion_update_list"></ul>
            </div>
            <div class="salt_pageBlockItem one-third" id="minion_update_tools">
                <div class="salt_sectionTitle">Update Commands</div>
                <button minion="<?= $minion ?>" id="salt_minionUpdate_all">Install all updates</button>
                <button minion="<?= $minion ?>" id="salt_minionUpdate_selected">Install selected updates</button>
            </div>
        </div>
    </div>
</div>