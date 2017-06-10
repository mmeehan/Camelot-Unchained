/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: Mehuge (mehuge@sorcerer.co.uk)
 * @Date: 2017-05-03 20:46:31
 * @Last Modified by: Mehuge (mehuge@sorcerer.co.uk)
 * @Last Modified time: 2017-06-09 20:33:24
 */

import { client, hasClientAPI } from 'camelot-unchained';
import { Module } from 'redux-typed-modules';
import { slash, isClient } from '../game/slash';
import { Ingredient, InventoryItem, Recipe, Template, Message, SlashVoxStatus } from '../types';
import { VoxStatus, VoxIngredient } from '../game/crafting';

export interface JobState {
  loading: boolean;                   // Are we starting up?
  status: string;                     // Vox status (if known)
  ready: boolean;                     // Crafting complete? (Item Ready)  -- TODO Do we need this?
  type: string;                       // What type of crafting are we doing?
  started: string;                    // When last job started
  endin: string;                      // How long until it ends
  recipe: Recipe;                     // Selected Recipe
  template: Template;                 // Selected Template (make job)
  quality: number;                    // Desired quality
  possibleIngredients: InventoryItem[];  // ingredients that can go in the vox
  ingredients: Ingredient[];          // ingredients in the vox
  name: string;                       // Item Name (make)
  message: Message;                   // Last message from vox
  count: number;                      // Number of items to make
}

export const initialState = () : JobState => {
  return {
    status: 'unknown',
    ready: false,
    loading: false,
    type: null,
    started: null,
    endin: null,
    recipe: null,
    template: null,
    quality: undefined,
    possibleIngredients: [],
    ingredients: [],
    name: null,
    message: null,
    count: undefined,
  };
};

const module = new Module({
  initialState: initialState(),
  actionExtraData: () => {
    return {
      when: new Date(),
    };
  },
});

export const setJobType = module.createAction({
  type: 'crafting/job/set-job',
  action: (jobType: string) => {
    return { jobType };
  },
  reducer: (s, a) => {
    return { type: a.jobType };
  },
});

export const setStatus = module.createAction({
  type: 'crafting/job/set-status',
  action: (status: string) => {
    return { status };
  },
  reducer: (s, a) => {
    return { status: a.status };
  },
});

export const setCount = module.createAction({
  type: 'crafting/job/set-count',
  action: (count: number) => {
    return { count };
  },
  reducer: (s, a) => {
    return { count: a.count || 0 };
  },
});

export const setLoading = module.createAction({
  type: 'crafting/job/set-loading',
  action: (loading: boolean) => {
    return { loading };
  },
  reducer: (s, a) => {
    return { loading: a.loading };
  },
});

export const addIngredient = module.createAction({
  type: 'crafting/job/add-ingredient',
  action: (item: InventoryItem, qty: number, movedTo: string) => {
    return { item, qty, movedTo };
  },
  reducer: (s, a) => {
    const ingredients = [ ...s.ingredients ];
    const possibleIngredients = [ ...s.possibleIngredients ];
    let qty = a.qty;
    if (a.movedTo) {
      // find and remove quantity used from possibleIngredients
      possibleIngredients.forEach((ingredient: Ingredient) => {
        if (ingredient.id === a.item.id) {
          ingredient.stats.unitCount -= qty;
        }
      });
      // Upadte existing ingredient
      ingredients.forEach((ingredient: Ingredient) => {
        if (ingredient.id === a.movedTo) {
          ingredient.qty += qty;
          qty = 0;
        }
      });
      // or add new ingredient
      if (qty > 0) {
        ingredients.push(Object.assign({}, a.item, { id: a.movedTo, qty: a.qty, removeId: a.item.id }));
      }
      return { ingredients, possibleIngredients };
    }
    console.error('job:addIngredient missing modedTo ID');
    return {};
  },
});

export const removeIngredient = module.createAction({
  type: 'crafting/job/remove-ingredient',
  action: (item: Ingredient) => {
    return { item };
  },
  reducer: (s, a) => {
    console.log('REDUCER: crafting/job/remove-ingredient');
    const ingredients = s.ingredients.filter((item: InventoryItem) => item.id !== a.item.id);
    const possibleIngredients = [ ...s.possibleIngredients ];
    console.log('REMOVE INGREDIENT ' + JSON.stringify(a.item));
    console.log('FROM POSSIBLE INGREDIENTS ' + JSON.stringify(s.possibleIngredients));
    let qty = a.item.qty;  // the quantity of the item added to the vox
    possibleIngredients.forEach((ingredient: Ingredient) => {
      if (ingredient.id === a.item.removeId) {
        ingredient.stats.unitCount += qty;
        qty = 0;
      }
    });
    if (qty > 0) {
      possibleIngredients.push(a.item);
    }
    return { ingredients, possibleIngredients };
  },
});

export const startJob = module.createAction({
  type: 'crafting/job/start',
  action: () => {
    return { };
  },
  reducer: (s, a) => {
    return {};
  },
});

export const clearJob = module.createAction({
  type: 'crafting/job/clear',
  action: () => {
    return {};
  },
  reducer: (s, a) => {
    // Clearing a job effectively resets the vox back to idle
    return Object.assign({}, initialState(), { status: 'idle' });
  },
});

export const cancelJob = module.createAction({
  type: 'crafting/job/cancel',
  action: () => {
    return { };
  },
  reducer: (s, a) => {
    return {};
  },
});

export const collectJob = module.createAction({
  type: 'crafting/job/collect',
  action: () => {
    return { };
  },
  reducer: (s, a) => {
    // collecting a job, if successful, also clears it
    return Object.assign({}, initialState(), { status: 'idle' });
  },
});

export const setRecipe = module.createAction({
  type: 'crafting/job/set-recipe',
  action: (recipe: Recipe) => {
    return { recipe };
  },
  reducer: (s, a) => {
    return { recipe: a.recipe };
  },
});

export const setQuality = module.createAction({
  type: 'crafting/job/set-quality',
  action: (quality: number) => {
    return { quality };
  },
  reducer: (s, a) => {
    return { quality: a.quality || 0 };
  },
});

export const setName = module.createAction({
  type: 'crafting/job/set-name',
  action: (name: string) => {
    return { name };
  },
  reducer: (s, a) => {
    return { name: a.name };
  },
});

export const setMessage = module.createAction({
  type: 'crafting/job/set-message',
  action: (message: Message) => {
    return { message };
  },
  reducer: (s, a) => {
    return { message: a.message };
  },
});

export const setTemplate = module.createAction({
  type: 'crafting/job/set-template',
  action: (template: Template) => {
    return { template };
  },
  reducer: (s, a) => {
    return { template: a.template };
  },
});

export const gotVoxPossibleIngredients = module.createAction({
  type: 'crafting/job/got-vox-possible-ingredients',
  action: (possible: VoxIngredient[]) => {
    return { possible };
  },
  reducer: (s, a) => {
    return { possibleIngredients: mapVoxIngredientsToIngredients(a.possible) };
  },
});

function mapVoxIngredientsToIngredients(vis: VoxIngredient[]): Ingredient[] {
  const ingredients: Ingredient[] = [];
  for (let i = 0; i < vis.length; i++) {
    const item = vis[i].stats.item;
    ingredients.push({
      id: vis[i].id,
      removeId: vis[i].id,
      name: vis[i].givenName || vis[i].staticDefinition.name,
      qty: item.unitCount,
      stats: {
        quality: item.quality,
        unitCount: item.unitCount,
        weight: item.mass,
      },
      icon: vis[i].staticDefinition.iconUrl,
      description: vis[i].staticDefinition.description,
    });
  }
  return ingredients;
}

export const gotVoxStatus = module.createAction({
  type: 'crafting/job/got-vox-status',
  action: (status: VoxStatus) => {
    return { status };
  },
  reducer: (s, a) => {
    const status = a.status;
    const startTime = new Date(status.startTime);
    const endTime = new Date(startTime.valueOf() + (status.totalCraftingTime * 1000));
    const ingredients: Ingredient[] = mapVoxIngredientsToIngredients(a.status.ingredients);
    return {
      status: a.status.jobState,
      ready: undefined,
      type: a.status.jobType,
      started: startTime.toISOString(),
      endin: ((endTime.valueOf() - startTime.valueOf()) / 1000).toString(),
      recipe: a.status.recipeID && { id: a.status.recipeID, name: '' },
      name: a.status.givenName,
      template: status.template && { id: status.template.id, name: '' },
      ingredients,
    };
  },
});

export default module.createReducer();
