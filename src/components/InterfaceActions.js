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
    Dropdown,
    DropdownItem,
    DropdownPosition,
    KebabToggle
} from '@patternfly/react-core';
import { useNetworkDispatch, deleteConnection, changeConnectionState } from '../context/network';
import ModalConfirm from './ModalConfirm';

const _ = cockpit.gettext;

const InterfaceActions = ({ iface, connection }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const dispatch = useNetworkDispatch();

    const onToggle = isOpen => setIsOpen(isOpen);
    const onSelect = (event) => onToggle(!isOpen);

    const deleteActionLabel = connection.virtual ? _("Delete") : _("Reset");
    const openDeleteConfirmation = () => setShowDeleteConfirmation(true);
    const closeDeleteConfirmation = () => setShowDeleteConfirmation(false);
    const onDeleteConfirmation = () => {
        deleteConnection(dispatch, connection);
        closeDeleteConfirmation();
    };
    const renderDeleteConfirmation = () => {
        if (!showDeleteConfirmation) return null;

        return (
            <ModalConfirm
                title={cockpit.format(_("Delete '$0' configuration"), connection?.name)}
                isOpen={showDeleteConfirmation}
                onCancel={closeDeleteConfirmation}
                onConfirm={onDeleteConfirmation}
            >
                {_("Please, confirm that you really want to the delete the interface configuration.")}
            </ModalConfirm>
        );
    };

    const actions = [
        <DropdownItem key={`${iface.name}-change-state`}>
            <Button
                variant="link"
                onClick={() => changeConnectionState(dispatch, connection, !iface.link)}
            >
                {iface.link ? _("Disable") : _("Enable")}
            </Button>
        </DropdownItem>,
        <DropdownItem key={`${iface.name}-reset-connection`} className="dangerous-action">
            <Button variant="link" onClick={openDeleteConfirmation}>
                {deleteActionLabel}
            </Button>
        </DropdownItem>
    ];

    return (
        <>
            <Dropdown
                isPlain
                position={DropdownPosition.right}
                isOpen={isOpen}
                onSelect={onSelect}
                dropdownItems={actions}
                toggle={<KebabToggle id={`connection-${connection.id}-actions`} onToggle={onToggle} />}
            />
            { renderDeleteConfirmation() }
        </>
    );
};

export default InterfaceActions;
