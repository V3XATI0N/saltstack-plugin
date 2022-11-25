<div class="adminContentCatch headerOnPage">
    <div class="adminNewObjectToolbar">
        <input type="text" class="objectListFilter" placeholder="Filter" list_id="salt_minionItemList">
        <button class="salt_minionNewUserButton" minion="<?= $minion ?>">
            <img class="buttonIcon" src="/resource/white_plus.png">
            New User...
        </button>
    </div>
    <ul class="objectList flexGrid whole condensed" id="salt_minionItemList">
    </ul>
    <div class="loading_place" id="loadWait"></div>
</div>