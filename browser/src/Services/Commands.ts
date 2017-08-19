/**
 * Commands.ts
 *
 * Built-in Oni Commands
 */

import { remote } from "electron"

import * as Config from "./../Config"
import { IBuffer, INeovimInstance } from "./../neovim"
import { PluginManager } from "./../Plugins/PluginManager"

import { BufferUpdates } from "./../Services/BufferUpdates"
import { Formatter } from "./../Services/Formatter"
import { multiProcess } from "./../Services/MultiProcess"
import { QuickOpen } from "./../Services/QuickOpen"
import { tasks } from "./../Services/Tasks"

import * as UI from "./../UI/index"

import { CallbackCommand, CommandManager } from "./CommandManager"

import { replaceAll } from "./../Utility"

export const registerBuiltInCommands = (commandManager: CommandManager, pluginManager: PluginManager, neovimInstance: INeovimInstance, bufferUpdates: BufferUpdates) => {
    const config = Config.instance()

    const quickOpen = new QuickOpen(neovimInstance, bufferUpdates)
    const formatter = new Formatter(neovimInstance, pluginManager, bufferUpdates)

    const commands = [
        new CallbackCommand("editor.clipboard.paste", "Clipboard: Paste", "Paste clipboard contents into active text", () => pasteContents(neovimInstance)),
        new CallbackCommand("editor.clipboard.yank", "Clipboard: Yank", "Yank contents to clipboard", () => neovimInstance.input("y")),

        // Debug
        new CallbackCommand("oni.debug.openDevTools", "Open DevTools", "Debug Oni and any running plugins using the Chrome developer tools", () => remote.getCurrentWindow().webContents.openDevTools()),
        new CallbackCommand("oni.debug.reload", "Reload Oni", "Reloads the Oni instance. You will lose all unsaved changes", () => remote.getCurrentWindow().reload()),

        new CallbackCommand("oni.editor.maximize", "Maximize Window", "Maximize the current window", () => remote.getCurrentWindow().maximize()),

        // Language service
        new CallbackCommand("oni.editor.gotoDefinition", "Goto Definition", "Goto definition using a language service", () => pluginManager.gotoDefinition()),
        new CallbackCommand("oni.editor.findAllReferences", "Find All References", "Find all references using a language service", () => pluginManager.findAllReferences()),

        // Menu commands
        new CallbackCommand("oni.config.openConfigJs", "Edit Oni Config", "Edit configuration file ('config.js') for Oni", () => {
            let buffer: null | IBuffer = null
            neovimInstance.open(config.userJsConfig)
                .then(() => neovimInstance.getCurrentBuffer())
                .then((buf) => buffer = buf)
                .then(() => buffer.getLineCount())
                .then((count) => {
                    if (count === 1) {
                        let lines = [
                            // TODO: Export this to a file that we load, if the current config does not exist
                            // That way, we don't have to duplicate defaults between this file and Config.ts

                            "const activate = (Oni) => {",
                            "   console.log(\"config activated\")",
                            "}",
                            "",
                            "const deactivate = () => {",
                            "   console.log(\"config deactivated\")",
                            "}",
                            "",
                            "module.exports = {",
                            "   activate,",
                            "   deactivate,",
                            "  //add custom config here, such as",
                            "  //\"oni.useDefaultConfig\": true,",
                            "  //\"oni.bookmarks\": [\"~/Documents\",]",
                            "  //\"oni.loadInitVim\": false,",
                            "  //\"editor.fontSize\": \"14px\",",
                            "  //\"editor.fontFamily\": \"Monaco\"",
                            "}",
                        ]
                        buffer.setLines(0, lines.length, false, lines)
                    }
                })
        }),

        new CallbackCommand("oni.config.openInitVim", "Edit Neovim Config", "Edit configuration file ('init.vim') for Neovim", () => neovimInstance.open("$MYVIMRC")),

        new CallbackCommand("oni.editor.showLogs",
                            "Show Logs",
                            "Show all logs in the bottom panel",
                            () => UI.Actions.changeLogsVisibility(true)),

        new CallbackCommand("oni.openFolder", "Open Folder", "Set a folder as the working directory for Oni", () => openFolder(neovimInstance)),

        new CallbackCommand("oni.process.cycleNext", "Focus Next Oni", "Switch to the next running instance of Oni", () => multiProcess.focusNextInstance()),
        new CallbackCommand("oni.process.cyclePrevious", "Focus Previous Oni", "Switch to the previous running instance of Oni", () => multiProcess.focusPreviousInstance()),

        new CallbackCommand("language.formatter.formatDocument", "Format Document", "Use the language service to auto-format the document", () => formatter.formatBuffer()),

        new CallbackCommand("quickOpen.show", null, null, () => quickOpen.show()),
        new CallbackCommand("quickOpen.showBufferLines", null, null, () => quickOpen.showBufferLines()),

        new CallbackCommand("commands.show", null, null, () => tasks.show()),

        // Add additional commands here
        // ...
    ]

    commands.forEach((c) => commandManager.registerCommand(c))
}

import { clipboard} from "electron"

const pasteContents = (neovimInstance: INeovimInstance) => {
    const textToPaste = clipboard.readText()
    const sanitizedText = replaceAll(textToPaste, { "<": "<lt>" })
    neovimInstance.input(sanitizedText)
}

const openFolder = (neovimInstance: INeovimInstance) => {
    const dialogOptions: any = {
        title: "Open Folder",
        properties: ["openDirectory"],
    }

    remote.dialog.showOpenDialog(remote.getCurrentWindow(), dialogOptions, (folder: string[]) => {
        if (!folder || !folder[0]) {
            return
        }

        const folderToOpen = folder[0]
        neovimInstance.chdir(folderToOpen)
    })
}
