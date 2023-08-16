/*
 * Copyright (c) [2020] SUSE LLC
 *
 * All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of version 2 of the GNU General Public License as published
 * by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, contact SUSE LLC.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import cockpit from "cockpit";
import React, { useState } from 'react';
import {
    Button,
    Switch,
    Tooltip
} from '@patternfly/react-core';
import { useNetworkDispatch, deleteConnection, changeConnectionState } from '../context/network';
import ModalConfirm from './ModalConfirm';
import TrashIcon from '@patternfly/react-icons/dist/esm/icons/trash-icon';
import ResetIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';

const _ = cockpit.gettext;

const InterfaceActions = ({ iface, connection }) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const dispatch = useNetworkDispatch();

    const DeleteIcon = connection.virtual ? TrashIcon : ResetIcon;
    const deleteTooltip = connection.virtual ? _("Delete") : _("Reset");
    const changeStatusLabel = _("Enabled");
    const changeStatusLabelOff = _("Disabled");
    const changeStatusAction = iface.link ? _("Disable") : _("Enable");
    const changeStatusTooltip = cockpit.format(
        _("Click to $action it"),
        { action: changeStatusAction.toLowerCase() }
    );
    const openDeleteConfirmation = () => setShowDeleteConfirmation(true);
    const closeDeleteConfirmation = () => setShowDeleteConfirmation(false);
    const onDeleteConfirmation = () => {
        deleteConnection(dispatch, connection);
        closeDeleteConfirmation();
    };

    const renderDeleteConfirmation = () => {
        if (!showDeleteConfirmation) return null;

        const confirmationTitle = cockpit.format(
            _("$action '$iface' configuration"),
            { action: deleteTooltip, iface: connection?.name }
        );
        const confirmationMessage = cockpit.format(
            _("Please, confirm that you really want to $action the interface configuration."),
            { action:  deleteTooltip.toLowerCase() }
        );

        return (
            <ModalConfirm
                title={confirmationTitle}
                isOpen={showDeleteConfirmation}
                onCancel={closeDeleteConfirmation}
                onConfirm={onDeleteConfirmation}
            >
                {confirmationMessage}
            </ModalConfirm>
        );
    };

    const renderDeleteAction = () => {
        if (!connection.exists) return null;

        return (
            <>
                <Tooltip content={deleteTooltip}>
                    <Button
                        variant="link"
                        aria-label={`${deleteTooltip} ${iface.name}`}
                        className="delete-action"
                        onClick={openDeleteConfirmation}
                    >
                        <DeleteIcon />
                    </Button>
                </Tooltip>
                { renderDeleteConfirmation() }
            </>
        );
    };

    return (
        <>
            <Tooltip content={changeStatusTooltip}>
                <Switch
                    id={`${iface.name}-status-switcher}`}
                    aria-label={`${changeStatusAction} ${iface.name}`}
                    label={changeStatusLabel}
                    labelOff={changeStatusLabelOff}
                    className="interface-status-switcher"
                    isChecked={iface.link}
                    onChange={() => changeConnectionState(dispatch, connection, !iface.link)}
                />
            </Tooltip>
            { renderDeleteAction() }
        </>
    );
};

export default InterfaceActions;
