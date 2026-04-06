import React, { useState, useEffect } from 'react';
import { Dice6, X } from 'lucide-react';
import { Character } from '../types';

interface OperativeCardProps {
  operative: Character;
  setOperative: (operative: Character) => void;
}

export const OperativeCard: React.FC<OperativeCardProps> = ({ operative, setOperative }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [localOperative, setLocalOperative] = useState<Character>(operative);
  const [attackRoll, setAttackRoll] = useState<number | null>(null);
  const [defenseRoll, setDefenseRoll] = useState<number | null>(null);
  const [newWeapon, setNewWeapon] = useState<{ name: string; ammo: string }>({ name: '', ammo: '' });
  const [newEquipment, setNewEquipment] = useState<string>('');
  const [newSkill, setNewSkill] = useState<string>('');
  const [isAttackRolling, setIsAttackRolling] = useState<boolean>(false);
  const [isDefenseRolling, setIsDefenseRolling] = useState<boolean>(false);
  const rollDuration = 300;

  useEffect(() => {
    setOperative(localOperative);
  }, [localOperative]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target;
    setLocalOperative((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeaponChange = (index: number, e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setLocalOperative((prev) => {
      const weapons = [...prev.weapons];
      weapons[index] = {
        ...weapons[index],
        [name]: value,
      };
      return { ...prev, weapons };
    });
  };

  const addWeapon = (): void => {
    if (newWeapon.name.trim()) {
      setLocalOperative((prev) => ({
        ...prev,
        weapons: [
          ...prev.weapons,
          { name: newWeapon.name.trim(), ammo: +newWeapon.ammo || 0, rusted: false },
        ],
      }));
      setNewWeapon({ name: '', ammo: '' });
    }
  };

  const deleteWeapon = (indexToDelete: number): void => {
    setLocalOperative((prev) => ({
      ...prev,
      weapons: prev.weapons.filter((_, i) => i !== indexToDelete),
    }));
  };

  const incrementWeaponAmmo = (weaponIndex: number): void => {
    setLocalOperative((prev) => {
      const weapons = prev.weapons.map((weapon, index) =>
        index === weaponIndex ? { ...weapon, ammo: weapon.ammo + 1 } : weapon,
      );
      return { ...prev, weapons };
    });
  };

  const decrementWeaponAmmo = (weaponIndex: number): void => {
    setLocalOperative((prev) => {
      const weapons = prev.weapons.map((weapon, index) =>
        index === weaponIndex ? { ...weapon, ammo: weapon.ammo - 1 } : weapon,
      );
      return { ...prev, weapons };
    });
  };

  const addEquipment = (): void => {
    if (newEquipment.trim()) {
      setLocalOperative((prev) => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const deleteEquipment = (itemIndex: number): void => {
    setLocalOperative((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== itemIndex),
    }));
  };

  const addSkill = (): void => {
    if (newSkill.trim()) {
      setLocalOperative((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const deleteSkill = (itemIndex: number): void => {
    setLocalOperative((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== itemIndex),
    }));
  };

  const toggleEditMode = (): void => {
    setIsEditMode(!isEditMode);
  };

  const rollAttack = (): void => {
    setIsAttackRolling(true);
    setAttackRoll(null);

    setTimeout(() => {
      setAttackRoll(Math.floor(Math.random() * 6) + 1);
      setIsAttackRolling(false);
    }, rollDuration);
  };

  const rollDefense = (): void => {
    setIsDefenseRolling(true);
    setDefenseRoll(null);

    setTimeout(() => {
      setDefenseRoll(Math.floor(Math.random() * 6) + 1);
      setIsDefenseRolling(false);
    }, rollDuration);
  };

  const incrementFood = (): void => {
    setLocalOperative((prev) => ({
      ...prev,
      food: prev.food + 1,
    }));
  };

  const decrementFood = (): void => {
    setLocalOperative((prev) => ({
      ...prev,
      food: Math.max(prev.food - 1, 0),
    }));
  };

  const incrementLife = (): void => {
    setLocalOperative((prev) => ({
      ...prev,
      currentLife: Math.min(prev.currentLife + 1, prev.fullLife),
    }));
  };

  const decrementLife = (): void => {
    setLocalOperative((prev) => ({
      ...prev,
      currentLife: Math.max(prev.currentLife - 1, 0),
    }));
  };

  const incrementRadResistance = (): void => {
    setLocalOperative((prev) => ({
      ...prev,
      currentRadResistance: Math.min(prev.currentRadResistance + 1, prev.fullRadResistance),
    }));
  };

  const decrementRadResistance = (): void => {
    setLocalOperative((prev) => ({
      ...prev,
      currentRadResistance: Math.max(prev.currentRadResistance - 1, 0),
    }));
  };

  return (
    <div className="dark:bg-zinc-900 dark:text-white p-4 bg-gray-100/80 rounded-b rounded-tr">
      {isEditMode ? (
        <div className="flex flex-col flex-wrap">
          <div className="flex space-x-4">
            <div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={localOperative.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="echo"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  Echo
                </label>
                <input
                  type="text"
                  id="echo"
                  name="echo"
                  value={localOperative.echo}
                  onChange={handleInputChange}
                  placeholder="Echo"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <div>
                <label
                  htmlFor="money"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  Money
                </label>
                <input
                  type="number"
                  id="money"
                  name="money"
                  value={localOperative.money}
                  onChange={handleInputChange}
                  placeholder="Money"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label
                  htmlFor="xp"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  XP
                </label>
                <input
                  type="number"
                  id="xp"
                  name="xp"
                  value={localOperative.xp}
                  onChange={handleInputChange}
                  placeholder="XP"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label
                  htmlFor="food"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  Food
                </label>
                <input
                  type="number"
                  id="food"
                  name="food"
                  value={localOperative.food}
                  onChange={handleInputChange}
                  placeholder="Food"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="0"
                />
              </div>
              <div>
                <label
                  htmlFor="attack"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  Attack
                </label>
                <input
                  type="number"
                  id="attack"
                  name="attack"
                  value={localOperative.attack}
                  onChange={handleInputChange}
                  placeholder="Attack"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label
                  htmlFor="defense"
                  className="block text-sm dark:text-slate-400 font-medium text-gray-700"
                >
                  Defense
                </label>
                <input
                  type="number"
                  id="defense"
                  name="defense"
                  value={localOperative.defense}
                  onChange={handleInputChange}
                  placeholder="Defense"
                  className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div>
              <label
                htmlFor="fullLife"
                className="block text-sm dark:text-slate-400 font-medium text-gray-700"
              >
                Full Life
              </label>
              <input
                type="number"
                id="fullLife"
                name="fullLife"
                value={localOperative.fullLife}
                onChange={handleInputChange}
                placeholder="Full Life"
                className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="currentLife"
                className="block text-sm dark:text-slate-400 font-medium text-gray-700"
              >
                Current Life
              </label>
              <input
                type="number"
                id="currentLife"
                name="currentLife"
                value={localOperative.currentLife}
                onChange={handleInputChange}
                placeholder="Current Life"
                className="dark:bg-gray-800 w-[100px] mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                min="0"
                max={localOperative.fullLife}
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-4">
            <div>
              <label
                htmlFor="fullRadResistance"
                className="block text-sm dark:text-slate-400 font-medium text-gray-700"
              >
                Full Rad Res
              </label>
              <input
                type="number"
                id="fullRadResistance"
                name="fullRadResistance"
                value={localOperative.fullRadResistance}
                onChange={handleInputChange}
                placeholder="Full Rad Resistance"
                className="w-[100px] dark:bg-gray-800 mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="currentRadResistance"
                className="block text-sm dark:text-slate-400 font-medium text-gray-700"
              >
                Current Rad Res
              </label>
              <input
                type="number"
                id="currentRadResistance"
                name="currentRadResistance"
                value={localOperative.currentRadResistance}
                onChange={handleInputChange}
                placeholder="Current Rad Resistance"
                className="dark:bg-gray-800 w-[100px] mt-1 block p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                min="0"
                max={localOperative.fullRadResistance}
              />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Equipment</h3>
            <ul>
              {localOperative.equipment.map((item, index) => (
                <li key={index} className="flex my-2">
                  <div>{item}</div>
                  <button
                    className="ml-2 px-1 inline border bg-red-500 rounded"
                    onClick={() => deleteEquipment(index)}
                  >
                    <X className="text-white" size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                placeholder="Equipment Name"
                className="max-w-[216px] dark:bg-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={addEquipment}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
              >
                + Add item
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Skills</h3>
            <ul>
              {localOperative.skills.map((item, index) => (
                <li key={index} className="flex my-2">
                  <div>{item}</div>
                  <button
                    className="ml-2 px-1 inline border bg-red-500 rounded"
                    onClick={() => deleteSkill(index)}
                  >
                    <X className="text-white" size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Skill Name"
                className="max-w-[216px] dark:bg-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={addSkill}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
              >
                + Add skill
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Weapons / Ammo</h3>
            {localOperative.weapons.map((weapon, index) => (
              <div key={index} className="flex space-x-2 mt-2 items-center">
                <input
                  type="text"
                  name="name"
                  value={weapon.name}
                  onChange={(e) => handleWeaponChange(index, e)}
                  placeholder="Weapon Name"
                  className="max-w-[148px] dark:bg-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  name="ammo"
                  value={weapon.ammo}
                  onChange={(e) => handleWeaponChange(index, e)}
                  placeholder="Ammo"
                  className="dark:bg-gray-800 w-[60px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min="0"
                />
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={weapon.rusted}
                    onChange={() => {
                      setLocalOperative((prev) => {
                        const weapons = [...prev.weapons];
                        weapons[index] = { ...weapons[index], rusted: !weapons[index].rusted };
                        return { ...prev, weapons };
                      });
                    }}
                  />
                  <span className="text-sm">Rusted</span>
                </label>
                <button
                  onClick={() => deleteWeapon(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  title="Delete Weapon"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div className="flex space-x-2 mt-2">
              <input
                type="text"
                value={newWeapon.name}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    name: e.target.value,
                  })
                }
                placeholder="Weapon Name"
                className="max-w-[148px] dark:bg-gray-800 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                type="number"
                value={newWeapon.ammo}
                onChange={(e) =>
                  setNewWeapon({
                    ...newWeapon,
                    ammo: e.target.value,
                  })
                }
                placeholder="Ammo"
                className="dark:bg-gray-800 w-[60px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                min="0"
              />
              <button
                onClick={addWeapon}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
              >
                + Add weapon
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Notes</h3>
            <textarea
              id="notes"
              name="notes"
              value={localOperative.notes}
              onChange={handleInputChange}
              placeholder="Notes"
              className="dark:bg-gray-800 mt-1 block w-1/2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setOperative(localOperative);
                toggleEditMode();
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded mt-4 hover:bg-emerald-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{localOperative.name}</h2>
              <p className="text-sm dark:text-slate-400 text-gray-500">{localOperative.echo}</p>
            </div>
            <div>
              <button
                onClick={toggleEditMode}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm dark:text-slate-400 text-gray-500 mb-4">
            <span><strong>Money:</strong> {localOperative.money} ₽</span>
            <span><strong>XP:</strong> {localOperative.xp}</span>
            <span className="flex items-center gap-2">
              <strong>Food:</strong> {localOperative.food}
              <button
                onClick={incrementFood}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
              >
                +1
              </button>
              <button
                onClick={decrementFood}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
              >
                -1
              </button>
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-6">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm dark:text-slate-400 text-gray-500 mb-0">
                    <strong>Life:</strong> {localOperative.currentLife}/{localOperative.fullLife}
                  </p>
                  <button
                    onClick={incrementLife}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={decrementLife}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    -1
                  </button>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-sm dark:text-slate-400 text-gray-500 mb-0">
                    <strong>Rad Res:</strong> {localOperative.currentRadResistance}/
                    {localOperative.fullRadResistance}
                  </p>
                  <button
                    onClick={incrementRadResistance}
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                  >
                    +1
                  </button>
                  <button
                    onClick={decrementRadResistance}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    -1
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm dark:text-slate-400 text-gray-500">
                <strong>Attack:</strong> {localOperative.attack}
              </span>
              <button
                onClick={rollAttack}
                disabled={isAttackRolling}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 h-[40px] rounded
                           hover:from-green-600 hover:to-emerald-700 transition-all duration-300
                           shadow-lg hover:shadow-xl
                           disabled:opacity-50 disabled:cursor-not-allowed
                           font-medium flex items-center gap-2"
              >
                <div className={`flex ${isAttackRolling ? 'animate-bounce' : ''}`}>
                  <Dice6
                    className={`inline-block ${isAttackRolling ? 'animate-spin' : ''}`}
                    size={20}
                  />
                </div>
              </button>
              {attackRoll !== null && (
                <div className="animate-bounce-in">
                  <div className="bg-gradient-to-br from-zinc-500 to-emerald-600 text-white px-2 py-1 rounded shadow-lg flex items-center justify-center min-w-[40px] h-[40px]">
                    <p className="text-2xl font-bold">{attackRoll}</p>
                  </div>
                </div>
              )}
              {attackRoll !== null && (
                <span className="text-sm dark:text-white text-gray-700">
                  ({localOperative.attack >= 0 ? '+' : ''}
                  {localOperative.attack})
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm dark:text-slate-400 text-gray-500">
                <strong>Defense:</strong> {localOperative.defense}
              </span>
              <button
                onClick={rollDefense}
                disabled={isDefenseRolling}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-3 py-2 h-[40px] rounded
                           hover:from-yellow-600 hover:to-amber-700 transition-all duration-300
                           shadow-lg hover:shadow-xl
                           disabled:opacity-50 disabled:cursor-not-allowed
                           font-medium flex items-center gap-2"
              >
                <div className={`flex ${isDefenseRolling ? 'animate-bounce' : ''}`}>
                  <Dice6
                    className={`inline-block ${isDefenseRolling ? 'animate-spin' : ''}`}
                    size={20}
                  />
                </div>
              </button>
              {defenseRoll !== null && (
                <div className="animate-bounce-in">
                  <div className="bg-gradient-to-br from-zinc-400 to-orange-500 text-white px-2 py-1 rounded shadow-lg flex items-center justify-center min-w-[40px] h-[40px]">
                    <p className="text-2xl font-bold">{defenseRoll}</p>
                  </div>
                </div>
              )}
              {defenseRoll !== null && (
                <span className="text-sm dark:text-white text-gray-700">
                  ({localOperative.defense >= 0 ? '+' : ''}
                  {localOperative.defense})
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-6">
            <div className="md:w-1/2">
              <h3 className="text-sm dark:text-slate-400 text-gray-500 font-semibold mb-1">
                Equipment
              </h3>
              <ul className="text-sm dark:text-slate-300 text-gray-700 list-none">
                {localOperative.equipment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-sm dark:text-slate-400 text-gray-500 font-semibold mb-1">
                Skills
              </h3>
              <ul className="text-sm dark:text-slate-300 text-gray-700 list-none">
                {localOperative.skills.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-4 md:mt-0">
              <h3 className="text-sm dark:text-slate-400 text-gray-500 font-semibold mb-1">
                Weapons
              </h3>
              <ul className="text-sm dark:text-slate-300 text-gray-700 list-none">
                {localOperative.weapons.map((weapon, index) => (
                  <li key={index} className="flex items-center space-x-2 mb-2">
                    <span>
                      <strong>{weapon.name}:</strong> {weapon.ammo}
                    </span>
                    <button
                      onClick={() => incrementWeaponAmmo(index)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => decrementWeaponAmmo(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      -1
                    </button>
                    <label className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={weapon.rusted}
                        onChange={() => {
                          setLocalOperative((prev) => {
                            const weapons = [...prev.weapons];
                            weapons[index] = { ...weapons[index], rusted: !weapons[index].rusted };
                            return { ...prev, weapons };
                          });
                        }}
                      />
                      <span className="text-sm">Rusted</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 text-sm dark:text-slate-400 text-gray-500">
            <strong>Notes:</strong>
            <p className="whitespace-pre-wrap text-sm dark:text-slate-300 text-gray-700 mt-1">
              {localOperative.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
