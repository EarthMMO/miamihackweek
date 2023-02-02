export default function HealthBar({
  character,
  avatar,
  partyMember = false,
}: any) {
  if (!character) return null;
  const healthPercentage = character.health / character.maxHealth;
  const manaPercentage = character.mana / character.maxMana;

  return (
    <div className={`z-10 absolute w-[100px] ${partyMember ? "mt-24" : ""}`}>
      <div className={`flex w-[100px] flex-row justify-between`}>
        <div className={`ml-2 text-black font-bold`}>{character.name}</div>
        {/* <div className={`text-black font-bold`}>Lvl {character.level}</div> */}
      </div>
      <div className={`w-[100px] h-4 bg-black flex flex-row`}>
        <span className={`w-full h-4 bg-green-500 absolute`} />
        <span className={`text-white font-bold mx-auto z-10 text-sm`}>
          {character.health} / {character.maxHealth}
        </span>
      </div>
      <div className={`w-[100px] h-4 bg-black flex flex-row`}>
        <span className={`w-full h-4 bg-blue-500 absolute`} />
        <span className={`text-white font-bold mx-auto z-10 text-sm`}>
          {character.mana} / {character.maxMana}
        </span>
      </div>
    </div>
  );
}
