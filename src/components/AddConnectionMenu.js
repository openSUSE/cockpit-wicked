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

import React, { useState } from 'react';
import { Dropdown, DropdownItem } from '@patternfly/react-core';
import { DropdownToggle } from '@patternfly/react-core/deprecated';
import BridgeForm from './BridgeForm';
import BondForm from './BondForm';
import VlanForm from './VlanForm';

import cockpit from 'cockpit';

const _ = cockpit.gettext;

const formComponents = {
    BondForm,
    BridgeForm,
    VlanForm
};

const AddConnectionMenu = () => {
    const [isOpen, setOpen] = useState(false);
    const [formComponent, setFormComponent] = useState(null);
    const Component = formComponents[formComponent];

    const toggle = () => {
        setOpen(!isOpen);
        if (isOpen) {
            const toggle = document.getElementById('add-buttons-toggle');
            toggle.focus();
        }
    };

    const dropdownItems = [
        <DropdownItem key="bond" component="button" onClick={() => setFormComponent('BondForm')}>
            {_("Bond")}
        </DropdownItem>,
        <DropdownItem key="bridge" component="button" onClick={() => setFormComponent('BridgeForm')}>
            {_("Bridge")}
        </DropdownItem>,
        <DropdownItem key="vlan" component="button" onClick={() => setFormComponent('VlanForm')}>
            {_("VLAN")}
        </DropdownItem>,
    ];

    return (
        <>
            <Dropdown
                onSelect={toggle}
                toggle={<DropdownToggle id="add-buttons-toggle" onToggle={toggle}>{_("Add")}</DropdownToggle>}
                isOpen={isOpen}
                dropdownItems={dropdownItems}
            />
            { Component && <Component isOpen onClose={() => setFormComponent(null)} /> }
        </>
    );
};

export default AddConnectionMenu;
