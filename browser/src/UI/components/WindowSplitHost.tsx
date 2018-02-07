/**
 * ISplitHost.tsx
 *
 * React component that hosts an IEditor implementation
 */

import * as React from "react"

import * as Oni from "oni-api"

export interface IWindowSplitHostProps {
    split: Oni.IWindowSplit
    containerClassName: string
    isFocused: boolean
    onClick: (evt: React.MouseEvent<HTMLElement>) => void
}

/**
 * Component responsible for rendering an individual window split
 */
export class WindowSplitHost extends React.PureComponent<IWindowSplitHostProps, {}> {
    public render(): JSX.Element {
        const className =
            this.props.containerClassName + (this.props.isFocused ? " focus" : " not-focused")
        return (
            <div
                className="container vertical full"
                onClick={evt => (!this.props.isFocused ? this.props.onClick(evt) : null)}
            >
                <div className={className}>{this.props.split.render()}</div>
            </div>
        )
    }
}
