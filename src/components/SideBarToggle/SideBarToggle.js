/**
 * Created by jacob.mendt@pikobytes.de on 22.05.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CloseIcon from 'react-ionicons/lib/MdClose';
import ListIcon from 'react-ionicons/lib/MdList';
import './SideBarToggle.scss';

export default class SideBarToggle extends Component {
	constructor(props) {
		super(props);

		this.state = {
			toggleIn: props.toggleIn,
		}
	}

	handleClickToggle() {
		const newToggleIn = !this.state.toggleIn;
		this.setState(
			{ toggleIn: newToggleIn },
			() => {
				if (this.props.onToggle) {
					this.props.onToggle(newToggleIn);
				}
			}
		);
	}

	/**
	 * Make sure that the component state stays in sync with the external toggleIn state
	 */
	componentDidUpdate () {
		const { toggleIn } = this.props;

		if (toggleIn !== this.state.toggleIn) {
			this.setState({
				toggleIn: toggleIn,
			});
		}
	}

	render () {
		const { className, count } = this.props;
		const { toggleIn } = this.state;

		return (
			<div
				className={`digas-sidebar-toggle${className.length > 0 ? className : ''}${toggleIn ? ' toggle-in' : ' toggle-out'}`}
				onClick={this.handleClickToggle.bind(this)}
			>
				{
					!toggleIn
					? <ListIcon fontSize="50px"/>
					: <CloseIcon fontSize="50px" />
				}
				{
					count > 0 && (<span className="digas-badge">{count}</span>)
				}
			</div>
		)
	}
}

SideBarToggle.defaultProps = {
	className: '',
	count: 0,
	toggleIn: false,
};

SideBarToggle.propTypes = {
	className: PropTypes.string,
	count: PropTypes.number,
	onToggle: PropTypes.func,
	toggleIn: PropTypes.bool,
};