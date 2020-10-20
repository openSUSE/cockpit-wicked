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
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

const _ = cockpit.gettext;

const TypesFilter = ({ types, onSelect = () => {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState([]);

    return (
        <Select
            variant={SelectVariant.checkbox}
            onToggle={(isOpen) => setIsOpen(isOpen)}
            toggleIcon={<FilterIcon />}
            placeholderText={_("Filter by type")}
            selections={selected}
            onSelect={(event, selection) => {
                let nextSelection;

                if (selected.includes(selection)) {
                    nextSelection = (selected.filter((i) => i !== selection));
                } else {
                    nextSelection = [...selected, selection];
                }

                setSelected(nextSelection);
                onSelect(nextSelection);
            }}
            isOpen={isOpen}
        >
            {types.map((type, index) => (
                <SelectOption key={index} value={type} />
            ))}
        </Select>
    );
};

export default TypesFilter;
