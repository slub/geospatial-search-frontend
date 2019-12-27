/**
 * Created by jacob.mendt@pikobytes.de on 03.06.19.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import './Popup.scss';

// Load configurations from environmental settings
const ROOT_ID = process.env.REACT_APP_ROOT_ID;

// Make sure to bind modal to your appElement (http://reactcommunity.org/react-modal/accessibility/)
if (document.getElementById(ROOT_ID)) {
	Modal.setAppElement(`#${ROOT_ID}`);
}

/**
 * React wrapper class for the OpenLayers map object
 */
export default class Popup extends Component {
	constructor(props) {
		super(props);

		this.state = {
			onCloseActive: false,
		};
	}

	handlePopupClose = () => {
		if (this.props.onClose) {
			this.props.onClose();
		}
	}


	componentDidMount () {
		if (this.props.onMount) {
			this.props.onMount();
		}
	}

	/**
	 * On mobile devices the onRequestClose always triggers immediatly when a feature
	 * outside the overlayed content element is triggered.
	 *
	 * As a work around we delay the activation of the outside close click behavior.
	 */
	activateCloseListener = () => {
		window.setTimeout(
			() => {
				this.setState({
					onCloseActive: true,
				})
			},
			100,
		);
	}

	render() {
		const { className, label } = this.props;
		const { onCloseActive } = this.state;
		return (
			<Modal
				isOpen={true}
				onAfterOpen={this.activateCloseListener}
				onRequestClose={this.handlePopupClose}
				shouldCloseOnOverlayClick={onCloseActive}
				contentLabel={label}
				overlayClassName="digas-popup-overlay"
				className={`digas-popup-container${className.length > 0 ? ` ${className}`: ''}`}
			>
				<div className="digas-popup-content">
					{this.props.children}
				</div>
			</Modal>
		);
	}
}

Popup.defaultProps = {
	className: '',
	label: 'Document ...',
};

Popup.propTypes = {
	children: PropTypes.any,
	className: PropTypes.string,
	label: PropTypes.string,
	onClose: PropTypes.func,
	onMount: PropTypes.func,
};
