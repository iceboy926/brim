/* @flow */

import {AutoSizer} from "react-virtualized"
import {Redirect} from "react-router-dom"
import {connect} from "react-redux"
import React from "react"

import {type DispatchProps, type State as S} from "../reducers/types"
import {NetworkError, UnauthorizedError} from "../models/Errors"
import {XControlBar} from "./ControlBar"
import {XDownloadProgress} from "./DownloadProgress"
import {XHistogram} from "./Histogram"
import {XLeftPane} from "./LeftPane"
import {XRightPane} from "../components/RightPane"
import {XSearchInspector} from "./SearchInspector"
import {XSearchResults} from "./SearchResults"
import {XSettingsModal} from "./SettingsModal"
import {XStatusBar} from "./StatusBar"
import {XTitleBar} from "./TitleBar"
import {XWhoisModal} from "./WhoisModal"
import AppError from "../models/AppError"
import ColumnChooser from "./ColumnChooser"
import ErrorFactory from "../models/ErrorFactory"
import StartupError from "./StartupError"
import dispatchToProps from "../lib/dispatchToProps"
import * as searchPage from "../actions/searchPage"
import * as view from "../reducers/view"

type StateProps = {|
  logsTab: boolean
|}

type Props = {|
  ...StateProps,
  ...DispatchProps
|}

type State = {
  ready: boolean,
  error: ?AppError
}

export default class Search extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {ready: false, error: null}
    props
      .dispatch(searchPage.init())
      .then(() => this.setState({ready: true}))
      .catch(e => this.setState({error: ErrorFactory.create(e)}))
  }

  render() {
    const {ready, error} = this.state
    if (error instanceof UnauthorizedError || error instanceof NetworkError)
      return <Redirect to="/connect " />
    if (error) return <StartupError error={error} />
    if (!ready) return null

    return (
      <div className="search-page-wrapper">
        <div className="search-page">
          <XLeftPane />
          <div className="search-page-main">
            <XTitleBar />
            <div className="search-page-header">
              <XControlBar />
              {this.props.logsTab && (
                <div className="search-page-header-charts">
                  <AutoSizer disableHeight>
                    {({width}) => <XHistogram height={80} width={width} />}
                  </AutoSizer>
                </div>
              )}
              <ColumnChooser />
            </div>
            <XSearchResults />
            <XStatusBar />
          </div>
          <XRightPane />
        </div>
        <XSearchInspector />
        <XDownloadProgress />
        <XWhoisModal />
        <XSettingsModal />
      </div>
    )
  }
}

export const stateToProps = (state: S): StateProps => ({
  logsTab: view.getShowLogsTab(state)
})

export const XSearch = connect<Props, {||}, _, _, _, _>(
  stateToProps,
  dispatchToProps
)(Search)
