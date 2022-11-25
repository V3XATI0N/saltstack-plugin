# Salt Minion Manager

[[_TOC_]]

This is a plugin, it doesn't do anything by itself.

## Installation

1. Set up a working instance of the <a href="https://github.com/V3XATI0N/php-app-framework">php-app-framework</a>
2. Install this plugin in the `/plugins/` directory

## Configuration

### Master Configuration

You'll need to make sure your Salt Master instance has a few options
enabled in order for this plugin to perform at its best.

* `cache` should be properly configured, otherwise stuff will not work.
* `external_auth` must be configured for the console user.

#### **IMPORTANT! User Configuration**

You can control which minions a user account has access to within this
console by adding some custom data to the Salt Master's configuration for that user. This is weird and everything but it is what it is. Here is an example:

```yaml
external_auth:
  pam:
    salt_console_admins%:
      - '__console__':
          match: '*'
          user_rank: admin
          group_rank: admin
          group: DEFAULT
      - .*
      - '@runner'
      - '@wheel'
    salt_console_users%:
      - '__console__':
          match: 'webserver*'
          user_rank: moderator
          group_rank: admin
          group: DEFAULT
      - .*
      - '@runner'
```
This will allow users in the `salt_console_admins` group (on your salt master) full access, while restricting the `salt_console_users` group to
minions that match `^webserver.*$`. It also prevents `salt_console_users` from doing anything with the `@wheel` salt functions.

This relies on the custom `__console__` keyword in a user's configuration - this is completely unused by Salt itself, but the Console will retrieve it when a user authenticates and apply the rules here to everything they do in the console. The `match` keyword causes every function the Console runs for the user to use the compound target `<whatever> and webserver*`, thus preventing a match with anything that isn't `webserver*`. You can also restrict the functions the API will allow (`.*` here) if you want Salt to restrict them further (anything disallowed by Salt will also be disallowed in the Console).

The other keywords inside the `__console__` dict control how the Console treats an authenticated user with respect to the Console app itsef. `group` refers to user groups defined in the Console, `user_rank` and `group_rank` apply permissions levels to the user. This is necessary since users who authenticate via the Salt API do not have user accounts stored locally, so the Console won't know where they belong. If this information isn't present for a user, the console won't allow them to do anything.

### Web Server Configuration

Log in to your console app as an admin, and enter your salt-api authentication
credentials on the `admin/settings` page, under **Salt Settings**. Options
that are actually required are `salt_api_host`, `salt_api_port`, `salt_api_user`,
and `salt_api_pass` (self-explanatory). These will link the Console to your
existing Salt-API instance.

You can define `salt_master_id` if you want, but it doesn't actually do
anything useful right now.

The `salt_api_auth` option allows anyone who can authenticate successfully with
Salt-API to also log in to the Console with whatever permissions are allowed
by Salt-API. Please note that this option is... a little shaky, and not
recommended for now. If you decide to use it, you will also need to make sure
the Core setting `allow_plugin_auth` is enabled.

By default, everyone will use the credentials you enter on the admin/settings
page, so you should probably use an account there with as few permissions
as possible (really it only needs to be able to authenticate).

## System Settings

This plugin provides the following System Settings options:

* `salt_cloud_manager`: Minion ID of the host that manages salt-cloud infrastructure
* `salt_api_per_user`: Allows core users to specify their own salt-api configuration (including host and port). Intended for hosting access to this application as a standalone tool people can use to manage their own Salt deployments. **does not actually work yet**
* `salt_master_id`: Global, default Salt Master minion ID.
* `salt_ssl_verify`: Whether or not to require a valid certificate on the Salt-API connection.
* `salt_api_addr`: Global, default Salt-API HTTP URL
* `salt_api_port`: Global, default Salt-API TCP port
* `salt_api_user`: Global, default salt-api auth username
* `salt_api_pass`: Global, default salt-api auth password
* `salt_api_auth`: Allow users defined by the default salt-api instance to authenticate and log in to the console.
* `salt_minion_shell_use_vt`: **Experimental** Really serves no purpose except to provide pretty colors in the Shell utility for minions. This does not work for Windows and various Linux distributions/versions tend to break with this enabled. **This has actually broken the shell in every configuration I've ever tried so it isn't recommended.**

## Security Considerations

The simplest way to use this plugin is to configure `salt_api_user` with an account that (with Salt's `external_auth` configuration) has full access, and then manage user accounts locally inside this app. *However*, this is not actually a great idea since that would mean anyone who logs in will have full access, and in Salt's auth log anything done by anyone will appear to be done by that one user account. Also, users defined locally have their credentials stored locally in their profile data, which isn't great.

A much smarter way to do things is to configure `salt_api_user` with a very limited account (as in, allowed to authenticate but nothing else), and enable `salt_api_auth` so that users have to use their own individual credentials to authenticate with Salt. If you do this, then the users will get the correct permissions, you don't have to store usernames/passwords locally, and they'll show up individually in your Salt Master's log.

## The UI

The plugin provides 5 top-level pages.

### MINIONS

<img src="resource/minion_list.png" height="32">

The homepage. Lists all the minions. From here, you can navigate to
specific minions and perform meta-actions to one or more minions, as
well as see high-priority information about your minions.

When you click on a minion's name you will be taken to its own page
where you can manage it directly using a number of other tools.

### TOOLS

<img src="resource/salt_tools.png" height="32">

This page is for reviewing current or past Salt jobs, deploying or
revoking SSH authorized keys to your environment, and deploying
packages. Fun fact: the Deploy Package function is completely blank
and does nothing at all.

### PILLAR

<img src="resource/pillar.png" height="32">

This page doesn't even exist, so that's fun.

### STATES

<img src="resource/states.png" height="32">

This page exists, but there's nothing on it.

### CLOUD

<img src="resource/cloud.png" height="32">

Manage your cloud infrastructure. Currently all it can do is list
instances visible to the `cloud` Salt runner. Eventually, it will do
more things (some of them may even be useful). When that happens, there
will be further documentation.

## Under Development

### The `SaltClient` class

There is now a `SaltClient` class to perform Salt actions in a more
trendy OOP way. To access this, initialize the class like so:

```php
$client = new SaltClient();
```

The `SaltClient` methods will use an existing auth token if you have
one, or automatically generate one otherwise. Currently, the following
methods exist:

#### GET AUTH TOKEN

Although there's no immediate need to retrieve an auth token for its
own sake, you can do that with the `get_token()` method.

```php
$token = $client->get_token($host, $port, $user, $pass);
```

All the arguments are optional; if you specify `host` and `port`, the
method will connect to the Salt API you give it. If you specify `user`
and `pass`, it will authenticate using those credentials. If you do
not specify anything, you will be connected according to the global
settings defined by the admin. Once a valid token has been obtained,
it will be stored in your session data until it expires, so there won't
be a whole new token generated every time you do anything.

#### GENERAL SALT COMMAND

Use the `call()` method to run any Salt-API call. Just pass it an
array in the format Salt-API expects.

```php
$data = $client->call([
    'client' => 'local',
    'tgt' => 'host.local',
    'fun' => 'cmd.run',
    'kwarg' => [
        'cmd' => 'echo "hello world"',
        'shell' => '/bin/bash'
    ]
]);
```

#### LIST PKI KEYS

Use `get_keys($minion = null)` to retrieve all PKI keys from Salt
or the PKI key for a specific minion.

```php
$all_keys = $client->get_keys();
$minion_key = $client->get_keys('host.local');
```

#### GET MINIONS AND GRAINS

The `get_minions($tgt)` method returns one or all minions
along with their grains. This data is returned from the minion grain
cache, so make sure that's enabled on your master. `$tgt` is a
**compound match** string.

```php
$all_minions = $client->get_minions('*');
$one_minion = $client->get_minions('host.local');
$some_minions = $client->get_minions('G@kernel:Windows and not host.local');
```

#### GET PILLAR DATA

Get pillar data with `get_pillar($tgt)`. This works just like `get_minions()`
except it returns pillar data instead. Also takes a **compound match** argument.

```php
$all_minions = $client->get_pillar('*');
$one_minion = $client->get_pillar('host.local');
$some_minions = $client->get_pillar('G@os:Ubuntu or G@kernel:Windows');
```