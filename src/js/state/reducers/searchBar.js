/* @flow */

import {indexInBounds} from "../../lib/Array"
import {onlyWhitespace} from "../../lib/Str"
import createReducer from "./createReducer"

export const initialState = {
  current: "",
  previous: "",
  pinned: [],
  editing: null,
  error: null
}

export type SearchBar = typeof initialState

export default createReducer(initialState, {
  SEARCH_BAR_CLEAR: () => ({...initialState}),
  SEARCH_BAR_RESTORE: (state, {value}) => {
    return {
      ...state,
      ...value
    }
  },

  SEARCH_BAR_INPUT_CHANGE: (state, {value}) => {
    if (state.editing === null) {
      return {
        ...state,
        current: value
      }
    } else {
      let newPins = [...state.pinned]
      newPins[state.editing] = value
      return {
        ...state,
        current: value,
        pinned: newPins
      }
    }
  },

  SEARCH_BAR_PIN: (state) => {
    if (onlyWhitespace(state.current)) return state
    else
      return {
        ...state,
        pinned: [...state.pinned, state.current],
        current: "",
        previous: "",
        editing: null
      }
  },

  SEARCH_BAR_PIN_EDIT: (state, {index}) => {
    if (index === null) {
      return {
        ...state,
        current: state.previous,
        editing: null
      }
    }
    if (indexInBounds(index, state.pinned)) {
      return {
        ...state,
        current: state.pinned[index],
        editing: index
      }
    } else {
      throw new Error(`Trying to edit a pin that does not exist: ${index}`)
    }
  },

  SEARCH_BAR_PIN_REMOVE: (state, {index}) => {
    if (indexInBounds(index, state.pinned)) {
      return {
        ...state,
        pinned: state.pinned.filter((_e, i) => i != index),
        editing: null
      }
    } else if (index === null) {
      return {
        ...state,
        current: "",
        editing: null,
        previous: ""
      }
    } else {
      throw new Error(`Trying to remove a pin that does not exist: ${index}`)
    }
  },

  SEARCH_BAR_PIN_REMOVE_ALL: (state) => ({
    ...state,
    editing: null,
    pinned: [],
    previous: ""
  }),

  SEARCH_BAR_SUBMIT: (state) => {
    if (state.editing === null) {
      return {
        ...state,
        previous: state.current,
        pinned: state.pinned.filter((s) => !onlyWhitespace(s)),
        error: null
      }
    } else {
      if (state.pinned.some(onlyWhitespace)) {
        return {
          ...state,
          editing: null,
          current: state.previous,
          pinned: state.pinned.filter((s) => !onlyWhitespace(s)),
          error: null
        }
      }
      return {
        ...state,
        error: null
      }
    }
  },

  SEARCH_BAR_PINS_SET: (state, {pinned}) => {
    return {
      ...state,
      pinned: [...pinned],
      previous: "",
      editing: null,
      current: ""
    }
  },
  SEARCH_BAR_PARSE_ERROR: (state, {error}) => ({
    ...state,
    error
  })
})