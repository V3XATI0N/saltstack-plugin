<div class="gridTop">
    <div class="gridLeft nav narrow-padding" id="salt_tools_nav">
        <div class="pageHeader">Tools</div>
        <div class="salt_toolsItem user navItem activePage" tool_id="check_job_id">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/tools_jobs.png">
            Check Recent Jobs
        </div>
        <div class="salt_toolsItem user navItem" tool_id="ssh_key_manage">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/tools_keys.png">
            Manage SSH Keys
        </div>
        <div class="salt_toolsItem user navItem" tool_id="pkg_deploy">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/tools_pkg.png">
            Deploy Package
        </div>
    </div>
    <div class="gridRight content">
        <div class="adminContentCatch">
            <div class="pageHeader" id="salt_toolsTitle"></div>
            <div id="salt_toolsContent"></div>
        </div>
    </div>
</div>
<script type="text/javascript">
$(document).ready(function () {
    salt_loadToolsPage('check_job_id');
});
</script>