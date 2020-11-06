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

import React from 'react';
import cockpit from 'cockpit';

import {
    Button,
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell,
    DataListAction,
    TextInput,
    Stack,
    StackItem,
    Split,
    SplitItem,
} from '@patternfly/react-core';

import PlusIcon from '@patternfly/react-icons/dist/js/icons/plus-icon';
import MinusIcon from '@patternfly/react-icons/dist/js/icons/minus-icon';
import IPInput from './IPInput';
import { createRoute } from '../lib/model/routes';

const _ = cockpit.gettext;

const FIELDS = {
    destination: { component: IPInput, props: { placeholder: _("Destination"), "aria-label": _("Destination") } },
    gateway: { component: IPInput, props: { placeholder: _("Gateway"), "aria-label": _("Gateway") } },
    options: { component: TextInput, props: { placeholder: _("Options"), "aria-label": _("Options") } },
};

const RoutesDataList = ({ routes, updateRoutes }) => {
    const addRoute = () => {
        const route = createRoute();
        updateRoutes({ ...routes, [route.id]: route });
    };

    const updateRoute = (id, field, value) => {
        const route = { ...routes[id] };
        route[field] = value;
        // TODO: check if this do not generate not needed re-renders
        updateRoutes({ ...routes, [id]: route });
    };

    const deleteRoute = (id) => {
        const nextRoutes = Object.fromEntries(
            Object.entries(routes).filter(([key, route]) => key != id)
        );

        updateRoutes(nextRoutes);
    };

    const renderRoute = ({ id, ...route }) => {
        const cells = Object.keys(route).map((fieldKey) => {
            const field = FIELDS[fieldKey];

            if (!field) return null;

            const FieldComponent = field.component;

            return (
                <DataListCell key={`route-${id}-${fieldKey}`}>
                    <FieldComponent
                      defaultValue={route[fieldKey]}
                      onChange={(value) => updateRoute(id, fieldKey, value)}
                      onError={(value) => console.log("Invalid value", value, "for", fieldKey, "on route", id)}
                      {...field.props}
                    />
                </DataListCell>
            );
        });

        return (
            <DataListItem key={`route-${id}`}>
                <DataListItemRow>
                    <DataListItemCells dataListCells={cells} />
                    <DataListAction>
                        <Button variant="secondory" className="btn-sm" onClick={() => deleteRoute(id)}>
                            <MinusIcon />
                        </Button>
                    </DataListAction>
                </DataListItemRow>
            </DataListItem>
        );
    };

    return (
        <Stack className="data-list-form" hasGutter>
            <StackItem>
                <Split hasGutter>
                    <SplitItem isFilled />
                    <SplitItem>
                        <Button variant="primary" className="btn-sm" onClick={() => addRoute() }>
                            <PlusIcon />
                        </Button>
                    </SplitItem>
                </Split>
            </StackItem>
            <StackItem>
                <DataList isCompact aria-label={_("Routes data list")}>
                    {Object.values(routes).map((route) => renderRoute(route))}
                </DataList>
            </StackItem>
        </Stack>
    );
};

export default RoutesDataList;
