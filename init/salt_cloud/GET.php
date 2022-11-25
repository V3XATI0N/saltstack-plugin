<div class="gridTop">
    <div class="gridLeft nav narrow-padding" id="salt_cloud_nav">
        <div class="pageHeader">Cloud</div>
        <div class="salt_cloudItem user navItem activePage" cloud_id="list">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/cloud_list.png">
            Instances
        </div>
        <div class="salt_cloudItem user navItem" cloud_id="providers">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/cloud_providers.png">
            Providers
        </div>
        <div class="salt_cloudItem user navItem" cloud_id="Maps">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/cloud_maps.png">
            Maps
        </div>
        <div class="salt_cloudItem user navItem" cloud_id="profiles">
            <img class="navItemIcon" src="/resource/plugins/salt/assets/cloud_profiles.png">
            Profiles
        </div>
    </div>
    <div class="gridRight content" id="salt_cloud_content">
        <div class="adminContentCatch">
            <div id="salt_cloud_content_main"></div>
        </div>
    </div>
</div>
<script type="text/javascript">
$(document).ready(function () {
    salt_loadCloudPage('list');
});
</script>