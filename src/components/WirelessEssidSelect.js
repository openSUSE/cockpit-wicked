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
    DropdownPosition,
    DropdownToggle,
    InputGroup,
    Spinner,
    TextInput
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';
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
            return [<DropdownItem key="spinner"><Spinner size="sm" />{_("Scanning...")}</DropdownItem>];
        }

        return essidList.map(value => <DropdownItem key={value} onClick={() => onSelect(value)}>{value}</DropdownItem>);
    };

    return (
        <InputGroup>
            <TextInput id="essid" value={essid} onChange={setEssid} type="text" aria-label="Essid" />
            <Dropdown
              position={DropdownPosition.right}
              toggle={
                  <DropdownToggle toggleIndicator={null} onToggle={onToggle} aria-label="Essid scanned list" id="essid_scanned_list">
                      <SearchIcon />
                  </DropdownToggle>
              }
              isOpen={isOpen}
              isPlain
              dropdownItems={renderOptions()}
            />
        </InputGroup>
    );
};

export default WirelessEssidSelect;
