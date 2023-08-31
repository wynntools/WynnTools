<div align="center">
    <h1>WynnTools</h1>
    <h4>The only WynnCraft Discord bot that uses images (That I have seen)</h4>
</div>
<div align="center">   
    <a><img src="https://img.shields.io/github/package-json/v/kathund/WynnTools" alt="Version"></a>
    <a href="https://discord.com/invite/2vAuyVvdwj"><img src="https://img.shields.io/discord/926873163411910746?color=7289DA&label=Discord" alt="Discord"></a>
    <a><img src="https://wakatime.com/badge/user/2b7c6789-3672-4def-94e6-41ba1c8749a3/project/ba177dfd-57ca-4511-af8a-ec449a281488.svg" alt="Wakatime"></a>
    <a herf="https://github.com/Kathund/WynnTools/actions/workflows/ci-cd.yml"><img src="https://github.com/Kathund/WynnTools/actions/workflows/ci-cd.yml/badge.svg" alt="CL/CD Test Status"></a>
</div>

## Sections

- [Commands](#commands)
- [Change Log](#change-log)
- [Discord/Support](#discord)

### Commands



`< >` = Required arguments, `[ ]` = Optional arguments

#### General Commands

| Command               | Description                                                        | Syntax                                                               | Example                                                     | Response                                             |
| --------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| about                 | Shows info about the bot.                                          | `/about`                                                             | `/about`                                                    | ![](src/assets//readme/aboutExample.png)             |
| fun-facts config      | Set the config for the fun facts in your server.                   | `/fun-facts config [channel] [role] [ghost-ping] [delete] [disable]` | `/fun-facts config`                                         | ![](src/assets/readme/funFactsConfigExample.png)     |
| fun-facts disable     | Disable the fun facts in your server.                              | `/fun-facts disable `                                                | `/fun-facts disable`                                        | ![](src/assets/readme/funFactsDisableExample.png)    |
| fun-facts enable      | Enable the fun facts in your server (If you already have a config) | `/fun-facts enable `                                                 | `/fun-facts enable`                                         | ![](src/assets/readme/funFactsEnableExample.png)     |
| fun-facts suggest     | Suggest a fun fact for daily fun facts.                            | `/fun-facts suggest <fact>`                                          | `/fun-facts suggest WynnCraft was released on29 April 2013` | ![](src/assets/readme/funFactsSuggestExample.png)    |
| fun-facts setup-guide | Fun Facts Setup Guide.                                             | `/fun-facts setup-guide `                                            | `/fun-facts setup-guide`                                    | ![](src/assets/readme/funFactsSetupGuideExample.png) |
| guild                 | Displays the statistics of the specified guild.                    | `/guild <guild-name>`                                                | `/guild KongoBoys`                                          | ![](src/assets/readme/guildExample.png)              |
| report-bug            | Report a bug to the dev.                                           | `/report-bug`                                                        | `/report-bug`                                               | ![](src/assets/readme/reportBugExample.png)          |
| stats                 | Display Stats about a user.                                        | `/stats <player>`                                                    | `/stats Udderly_Cool`                                       | ![](src/assets/readme/statsExample.png)              |
| user                  | Shows info about you or a selected user.                           | `/user [discord-user]`                                               | `/user`                                                     | ![](src/assets/readme/userExample.png)               |

#### Locked Dev commands

| Command               | Description                                          | Syntax                                    | Example                                                               | Response                                          |
| --------------------- | ---------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| blacklist add         | Add a user to blacklist.                             | `/blacklist add <discord-id>`             | `/blacklist add 608584543506530314`                                   | ![](src/assets/readme/blacklistAddExample.png)    |
| blacklist remove      | Remove a user to blacklist.                          | `/blacklist remove <discord-id>`          | `/blacklist remove 608584543506530314`                                | ![](src/assets/readme/blacklistRemoveExample.png) |
| clear-cache           | Clear Cache.                                         | `/clear-cache <cache-type>`               | `/clear-cache Mojang`                                                 | ![](src/assets/readme/clearCacheExample.png)      |
| embed edit            | Edit an embed to a new embed.                        | `/embed edit <message-link> <embed-link>` | `/embed edit https://discord.com/xxxx/xxxx https://starb.in/xxx.json` | ![](src/assets/readme/Example.png)                |
| embed send            | Send an embed.                                       | `/embed send <embed-link> <channel>`      | `/embed send https://starb.in/xxx.json funny-channel-name`            | ![](src/assets/readme/Example.png)                |
| embed source          | Returns the starb.in link of a given embed.          | `/embed source <message-link>`            | `/embed source https://discord.com/xxxx/xxxx`                         | ![](src/assets/readme/Example.png)                |
| fun-facts-dev approve | Approve a fun fact .                                 | `/fun-facts-dev approve <id>`             | `/fun-facts-dev approve 1`                                            | ![](src/assets/readme/Example.png)                |
| fun-facts-dev configs | View the configs for fun facts.                      | `/fun-facts-dev configs [server-id]`      | `/fun-facts-dev configs`                                              | ![](src/assets/readme/Example.png)                |
| fun-facts-dev delete  | Delete a fun fact.                                   | `/fun-facts-dev delete <type> <id>`       | `/fun-facts-dev delete 2`                                             | ![](src/assets/readme/Example.png)                |
| fun-facts-dev deny    | Deny a fun fact.                                     | `/fun-facts-dev deny <id>`                | `/fun-facts-dev deny 1`                                               | ![](src/assets/readme/Example.png)                |
| fun-facts-dev list    | Generate a list of all fun facts or all suggestions. | `/fun-facts-dev list <type>`              | `/fun-facts-dev list facts`                                           | ![](src/assets/readme/Example.png)                |
| fun-facts-dev view    | View a fun fact.                                     | `/fun-facts-dev view <type> <id>`         | `/fun-facts-dev view facts 1`                                         | ![](src/assets/readme/Example.png)                |

## Change Log

### v1.0.0 🎉🎉

- With the release of v1.0.0 its the full public release of WynnTools.

## Credits

- [WynnCraft API](https://docs.wynncraft.com/)
- [Pixelic API](https://api.pixelic.de/)
