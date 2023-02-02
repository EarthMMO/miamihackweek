import React from "react";
import PropTypes from "prop-types";
import { first, inRange } from "lodash";

export const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const defaultColorPallet = [
  "#15c621",
  "#73c615",
  "#abc615",
  "#c6c615",
  "#c6ab15",
  "#c69015",
  "#c66715",
  "#cb4015",
  "#c62e15",
  "#c61515",
];

export function generateMinMaxForColors(healthBarColors) {
  if (!healthBarColors instanceof Array)
    throw new Error("argument must be an array!");

  return healthBarColors.map((color, index) => ({
    color,
    max: (index === 0 ? 101 : 100) - (100 / healthBarColors.length) * index,
    min: 100 - (100 / healthBarColors.length) * (index + 1),
  }));
}

export function getHealthBarBackgroundColor(percentage, healthBarColors) {
  if (!healthBarColors instanceof Array)
    throw new Error("argument must be an array!");
  if (isNaN(percentage)) throw new Error("percentage must be a number!");

  return first(
    generateMinMaxForColors(healthBarColors).filter((colorInfo) =>
      inRange(percentage, colorInfo.min, colorInfo.max)
    )
  ).color;
}

export default function HealthBar({
  character,
  percentage,
  colors = defaultColorPallet,
  width = 100,
  height = 24,
  enemy = false,
}) {
  return (
    <div className="flex-col">
      <div className={`ml-2 text-black font-bold`}>{character.name}</div>
      <div
        style={{
          borderRadius: "3px",
          border: "1px solid black",
          width,
          height,
          backgroundColor: "#000000",
        }}
      >
        <span className={`absolute text-white font-bold ml-2 z-10 text-sm`}>
          {character.health} / {character.maxHealth}
        </span>
        <div
          style={{
            borderRadius: "3px",
            width: `${percentage * 100}%`,
            height: "100%",
            minHeight: height - 2,
            backgroundColor: getHealthBarBackgroundColor(
              percentage * 100,
              colors
            ),
          }}
        >
          &nbsp;
        </div>
      </div>
    </div>
  );
}

HealthBar.propTypes = {
  percentage: (props, propName, componentName) => {
    if (
      props[propName] < 0 ||
      props[propName] > 100 ||
      isNaN(props[propName])
    ) {
      return new Error(
        `percentage must be between 0 and 100 including both ${componentName}`
      );
    }
  },
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  colors: PropTypes.arrayOf((propValue, key, componentName) => {
    if (!hexColorRegex.test(propValue[key])) {
      return new Error(
        `Invalid color code ${propValue[key]} supplied to ${componentName}`
      );
    }
  }),
};

//export default function HealthBar({
//  character,
//  avatar,
//  partyMember = false,
//}: any) {
//  if (!character) return null;
//  const healthPercentage = character.health / character.maxHealth;
//  const manaPercentage = character.mana / character.maxMana;
//
//  return (
//    <div className={`z-10 absolute w-[100px]`}>
//      <div className={`flex w-[100px] flex-row justify-between`}>
//        <div className={`ml-2 text-black font-bold`}>{character.name}</div>
//        {/* <div className={`text-black font-bold`}>Lvl {character.level}</div> */}
//      </div>
//      <div className={`w-[100px] h-4 bg-black flex flex-row`}>
//        <span className={`w-full h-4 bg-green-500 absolute`} />
//        <span className={`text-white font-bold mx-auto z-10 text-sm`}>
//          {character.health} / {character.maxHealth}
//        </span>
//      </div>
//      <div className={`w-[100px] h-4 bg-black flex flex-row`}>
//        <span className={`w-full h-4 bg-blue-500 absolute`} />
//        <span className={`text-white font-bold mx-auto z-10 text-sm`}>
//          {character.mana} / {character.maxMana}
//        </span>
//      </div>
//    </div>
//  );
//}
//
