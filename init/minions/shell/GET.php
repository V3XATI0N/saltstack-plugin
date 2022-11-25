<div id="salt_minionShellTop">

    <div id="salt_minionShellTools" class="adminNewObjectToolbar centered">
        <label>
            <input type="checkbox" id="salt_minionShellAsync">
            Async
        </label>
        <label>
            <input type="checkbox" id="salt_minionShellBg">
            Background
        </label>
        <label>
            <input class="fullwidth" type="text" id="salt_minionShellUser" placeholder="Run as..." value="root">
        </label>
        <label>
            <select id="salt_minionShellShell">
                <option selected="selected" disabled="disabled">Shell...</option>
            </select>
        </label>
        <label>
            <select id="salt_minionShellQC">
                <option selected="selected" disabled="disabled">Quick Commands...</option>
            </select>
        </label>
    </div>

    <div id="salt_minionShellBuffer"></div>

    <div id="salt_minionShellInputTools" class="adminNewObjectToolbar align-left">
        <input autocorrect="off" autocapitalize="none" minion="<?= $minion ?>" type="text" placeholder="Enter command" id="salt_minionShellCmdInput" class="fullwidth">
        <button minion="<?= $minion ?>" id="salt_minionShellCmdSubmit">Run</button>
    </div>

</div>