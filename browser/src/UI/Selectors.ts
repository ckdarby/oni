/**
 * Selectors.ts
 *
 * Selectors are basically helper methods for operating on the State
 * See Redux documents here fore more info:
 * http://redux.js.org/docs/recipes/ComputingDerivedData.html
 */

import * as State from "./State"

import * as _ from "lodash"

import * as types from "vscode-languageserver-types"

export const isPopupMenuOpen = (state: State.IState) => {
    const popupMenu = state.popupMenu
    return !!popupMenu
}

export const areCompletionsVisible = (state: State.IState) => {
    const autoCompletion = state.autoCompletion
    const entryCount = (autoCompletion && autoCompletion.entries) ? autoCompletion.entries.length : 0

    if (entryCount === 0) {
        return false
    }

    if (entryCount > 1) {
        return true
    }

    // In the case of a single entry, should not be visible if the base is equal to the selected item
    return autoCompletion != null && autoCompletion.base !== getSelectedCompletion(state)
}

export const getSelectedCompletion = (state: State.IState) => {
    const autoCompletion = state.autoCompletion
    return autoCompletion ? autoCompletion.entries[autoCompletion.selectedIndex].label : null
}

export const getAllErrorsForFile = (fileName: string, state: State.IState) => {

    if (!fileName) {
        return []
    }

    const allErrorsByKey = state[fileName]

    if (!allErrorsByKey) {
        return []
    }

    const arrayOfErrorsArray = Object.values(allErrorsByKey)
    return _.flatten<types.Diagnostic>(arrayOfErrorsArray)
}
