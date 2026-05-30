import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export default function NouveauPatient() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'Masculin',
    phone: '',
    city: 'Douala',
    pathologie: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Patient à sauvegarder:', form);
    navigate('/patients');
  };

  const inputClass = "w-full px-3 py-2 border border-(--ln) rounded-lg bg-(--sf) text-(--t1) focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/patients')} className="p-2 hover:bg-(--sf2) rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-(--t2)" />
        </button>
        <h1 className="text-2xl font-bold text-(--t1)">Nouveau patient</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-(--sf) rounded-xl border border-(--ln) p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Nom complet *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Âge *</label>
            <input
              type="number"
              required
              value={form.age}
              onChange={(e) => setForm({...form, age: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Sexe</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({...form, gender: e.target.value})}
              className={inputClass}
            >
              <option>Masculin</option>
              <option>Féminin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Ville</label>
            <select
              value={form.city}
              onChange={(e) => setForm({...form, city: e.target.value})}
              className={inputClass}
            >
              <option>Douala</option>
              <option>Yaoundé</option>
              <option>Bafoussam</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-(--t2) mb-1">Pathologie</label>
            <input
              type="text"
              value={form.pathologie}
              onChange={(e) => setForm({...form, pathologie: e.target.value})}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="px-4 py-2 border border-(--ln) text-(--t2) rounded-lg hover:bg-(--sf2) transition-colors"
          >
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
            <Save size={16} />
            Créer
          </button>
        </div>
      </form>
    </div>
  );
}
