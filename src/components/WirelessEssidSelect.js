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

import React, { useState, useEffect } from 'react';
import { fetchEssidList } from '../context/network';
import {
    Bullseye,
    Button,
    InputGroup,
    Select,
    SelectOption,
    SelectVariant,
    Spinner
} from '@patternfly/react-core';
import cockpit from 'cockpit';

const _ = cockpit.gettext;

const WirelessEssidSelect = ({ essid, setEssid, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [essidList, setEssidList] = useState([]);
    const [options, setOptions] = useState([]);
    const [scanning, setScanning] = useState(true);

    const obtainEssids = () => {
        fetchEssidList(name)
                .then(result => { setEssidList([...new Set([...result])]) })
                .catch(console.error);
    };

    const refreshOptions = React.useCallback(() => {
        const list = (essid && !essidList.includes(essid)) ? [...essidList, essid] : essidList;
        setOptions(list);
        setScanning(false);
        return list;
    }, [essidList, essid]);

    useEffect(() => {
        refreshOptions();
    }, [refreshOptions]);

    const reScan = () => {
        setScanning(true);
        obtainEssids();
    };

    const onToggle = isOpen => setIsOpen(isOpen);

    const clearSelection = () => {
        setEssid(undefined);
        setIsOpen(false);
    };

    const onCreateOption = (newValue) => {
        setOptions([...options, newValue]);
    };

    const onSelect = (event, selection, isPlaceholder) => {
        if (isPlaceholder) clearSelection();
        else {
            setEssid(selection);
            setIsOpen(false);
            console.log('selected:', selection);
        }
    };

    return (
        <InputGroup>
            { scanning ? (
                <Bullseye><Spinner size="lg" /></Bullseye>
            ) : (
                <>
                    <Select
                          typeAheadAriaLabel={_("Select a essid")}
                          placeholderText={_("Select an essid")}
                          variant={SelectVariant.typeahead}
                          value={essid}
                          isOpen={isOpen}
                          isCreatable
                          onClear={clearSelection}
                          selections={essid}
                          onSelect={onSelect}
                          onToggle={onToggle}
                          onCreateOption={onCreateOption}
                          id="essid"
                    >
                        {options.map((option, index) => (
                            <SelectOption
                                        key={index}
                                        value={option} label={option}
                            />
                        ))}
                    </Select>
                    <Button variant="primary" aria-label="scan essid network list" onClick={() => reScan()}>{_("Rescan")}</Button>
                </>)}
        </InputGroup>
    );
};

export default WirelessEssidSelect;
