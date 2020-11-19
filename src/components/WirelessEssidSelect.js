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

import React, { useState, useEffect, useCallback } from 'react';
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
    const [scanning, setScanning] = useState(true);

    const refreshList = useCallback((name) => {
        fetchEssidList(name)
                .then(result => {
                    const list = [...new Set([...result, essid])];
                    setEssidList(list.sort());
                    setScanning(false);
                })
                .catch(console.error);
    }, [essid]);

    useEffect(() => {
        refreshList(name);
    }, [name, refreshList]);

    const reScan = () => {
        setScanning(true);
        refreshList(name);
    };

    const onToggle = isOpen => setIsOpen(isOpen);

    const clearSelection = () => {
        setEssid(undefined);
        setIsOpen(false);
    };

    const onCreateOption = (newValue) => {
        setEssidList([...essidList, newValue]);
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
                        {essidList.map((option, index) => (
                            <SelectOption
                                        key={index}
                                        value={option} label={option}
                            />
                        ))}
                    </Select>
                    <Button variant="control" aria-label="scan essid network list" onClick={() => reScan()}>{_("Rescan")}</Button>
                </>)}
        </InputGroup>
    );
};

export default WirelessEssidSelect;
