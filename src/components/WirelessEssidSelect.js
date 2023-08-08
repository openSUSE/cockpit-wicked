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
import { fetchEssidList } from '../context/network';
import {
    Dropdown,
    DropdownItem,
    InputGroup,
    Spinner,
    TextInput
} from '@patternfly/react-core';
import { DropdownPosition, DropdownToggle } from '@patternfly/react-core/deprecated';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import ExclamationIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const WirelessEssidSelect = ({ essid, setEssid, iface }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [essidList, setEssidList] = useState(undefined);

    const refreshList = (name) => {
        fetchEssidList(name)
                .then(result => {
                    const list = [...new Set([...result])];
                    setEssidList(list.sort());
                })
                .catch(console.error);
    };

    const onToggle = isOpen => {
        if (isOpen) {
            setEssidList(undefined);
            refreshList(iface.name);
        }

        setIsOpen(isOpen);
    };

    const onSelect = (selection) => {
        setEssid(selection);
        setIsOpen(false);
    };

    const renderOptions = () => {
        if (!essidList) {
            return [
                <DropdownItem isDisabled key="scanning" icon={<Spinner size="md" />}>
                    {_("Scanning...")}
                </DropdownItem>
            ];
        }

        if (essidList.length === 0) {
            return [
                <DropdownItem isDisabled key="no-networks-found" icon={<ExclamationIcon />}>
                    {_("No networks found")}
                </DropdownItem>
            ];
        }

        return essidList.map(value => <DropdownItem key={value} onClick={() => onSelect(value)}>{value}</DropdownItem>);
    };

    return (
        <InputGroup>
            <TextInput id="essid" value={essid} onChange={(_e, val) => setEssid(val)} type="text" aria-label="Essid" />
            <Dropdown
              position={DropdownPosition.right}
              isOpen={isOpen}
              dropdownItems={renderOptions()}
              toggle={
                  <DropdownToggle id="essid-scanned-list" toggleIndicator={null} onToggle={onToggle} aria-label="Essid scanned list">
                      <SearchIcon />
                  </DropdownToggle>
              }
            />
        </InputGroup>
    );
};

export default WirelessEssidSelect;
