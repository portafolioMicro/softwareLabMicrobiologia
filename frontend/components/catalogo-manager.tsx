"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "./icon";
import {
  ActiveBadge,
  ErrorBox,
  Field,
  FormFooter,
  Modal,
  RowActions,
  TableShell,
  errorMessage,
  inputClass,
} from "./ui-bits";
import {
  addNormaAnalisis,
  analisisApi,
  categoriasApi,
  listNormaAnalisis,
  normasApi,
  removeNormaAnalisis,
  updateNormaAnalisis,
  type Analisis,
  type Categoria,
  type Crud,
  type Norma,
  type NormaAnalisis,
  type Usuario,
} from "@/lib/api";

/* ---------- Hooks de apoyo ---------- */

function useLoad<T>(loader: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await loader());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { items, loading, error, setError, reload };
}

function useEditor<T, I>(
  api: Crud<T, I>,
  idOf: (item: T) => number,
  reload: () => Promise<void>,
  setError: (m: string | null) => void,
) {
  const [modal, setModal] = useState<null | "nuevo" | T>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(input: I) {
    if (!modal) return;
    setSaving(true);
    setFormError(null);
    try {
      if (modal === "nuevo") await api.create(input);
      else await api.update(idOf(modal as T), input);
      setModal(null);
      await reload();
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: T, label: string) {
    if (!window.confirm(`¿Eliminar "${label}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.remove(idOf(item));
      await reload();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return { modal, setModal, formError, setFormError, saving, save, remove };
}

function Section({
  title,
  description,
  onNew,
  error,
  children,
}: {
  title: string;
  description: string;
  onNew?: () => void;
  error: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">{title}</h2>
          <p className="font-body-sm text-body-sm text-secondary">{description}</p>
        </div>
        {onNew && (
          <button
            onClick={onNew}
            className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-space-xs"
          >
            <Icon name="add" className="text-lg" />
            <span>Nuevo</span>
          </button>
        )}
      </div>
      {error && <ErrorBox message={error} />}
      {children}
    </div>
  );
}

/* ---------- Pestaña: Categorías ---------- */

function CategoriasTab({ esAdmin }: { esAdmin: boolean }) {
  const { items, loading, error, setError, reload } = useLoad(categoriasApi.list);
  const ed = useEditor(categoriasApi, (c: Categoria) => c.id_categoria, reload, setError);
  const [nombre, setNombre] = useState("");

  function abrir(c?: Categoria) {
    setNombre(c?.nombre_categoria ?? "");
    ed.setFormError(null);
    ed.setModal(c ?? "nuevo");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ed.save({ nombre_categoria: nombre.trim() });
  }

  return (
    <Section
      title="Categorías de matriz"
      description="Grupos de productos o superficies que analiza el laboratorio (lácteos, aguas, etc.)."
      onNew={esAdmin ? () => abrir() : undefined}
      error={error}
    >
      <TableShell
        heads={["Categoría", ""]}
        loading={loading}
        isEmpty={items.length === 0}
        emptyText="Todavía no hay categorías."
      >
        {items.map((c) => (
          <tr key={c.id_categoria} className="border-t border-surface-variant">
            <td className="px-space-md py-3 font-semibold">{c.nombre_categoria}</td>
            <td className="px-space-md py-3">
              {esAdmin && (
                <RowActions
                  onEdit={() => abrir(c)}
                  onDelete={() => ed.remove(c, c.nombre_categoria)}
                />
              )}
            </td>
          </tr>
        ))}
      </TableShell>

      {ed.modal && (
        <Modal
          title={ed.modal === "nuevo" ? "Nueva categoría" : "Editar categoría"}
          onClose={() => ed.setModal(null)}
        >
          <form onSubmit={submit} className="flex flex-col gap-space-md">
            <Field id="nombre_categoria" label="Nombre" required>
              <input
                id="nombre_categoria"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputClass}
              />
            </Field>
            <FormFooter error={ed.formError} saving={ed.saving} onCancel={() => ed.setModal(null)} />
          </form>
        </Modal>
      )}
    </Section>
  );
}

/* ---------- Pestaña: Normas ---------- */

function NormasTab({ esAdmin }: { esAdmin: boolean }) {
  const { items, loading, error, setError, reload } = useLoad(normasApi.list);
  const { items: categorias } = useLoad(categoriasApi.list);
  const ed = useEditor(normasApi, (n: Norma) => n.id_norma, reload, setError);
  const [form, setForm] = useState({ id_categoria: "", nombre_norma: "", descripcion: "", activo: true });
  const [verAnalisis, setVerAnalisis] = useState<Norma | null>(null);

  function abrir(n?: Norma) {
    setForm(
      n
        ? {
            id_categoria: String(n.id_categoria),
            nombre_norma: n.nombre_norma,
            descripcion: n.descripcion ?? "",
            activo: n.activo,
          }
        : { id_categoria: "", nombre_norma: "", descripcion: "", activo: true },
    );
    ed.setFormError(null);
    ed.setModal(n ?? "nuevo");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ed.save({
      id_categoria: Number(form.id_categoria),
      nombre_norma: form.nombre_norma.trim(),
      descripcion: form.descripcion.trim() || null,
      activo: form.activo,
    });
  }

  return (
    <Section
      title="Normas"
      description="Reglamentación contra la que se comparan los resultados. Cada norma define qué análisis aplican."
      onNew={esAdmin ? () => abrir() : undefined}
      error={error}
    >
      <TableShell
        heads={["Norma", "Categoría", "Estado", ""]}
        loading={loading}
        isEmpty={items.length === 0}
        emptyText="Todavía no hay normas. Se cargan cuando el laboratorio confirme cuáles aplica."
      >
        {items.map((n) => (
          <tr key={n.id_norma} className="border-t border-surface-variant">
            <td className="px-space-md py-3">
              <div className="font-semibold">{n.nombre_norma}</div>
              {n.descripcion && <div className="text-body-sm text-secondary">{n.descripcion}</div>}
            </td>
            <td className="px-space-md py-3">{n.categoria?.nombre_categoria ?? "—"}</td>
            <td className="px-space-md py-3">
              <ActiveBadge activo={n.activo} />
            </td>
            <td className="px-space-md py-3">
              <RowActions
                extra={
                  <button
                    onClick={() => setVerAnalisis(n)}
                    title="Análisis de la norma"
                    className="p-2 rounded-lg hover:bg-surface-container text-primary"
                  >
                    <Icon name="biotech" className="text-xl" />
                  </button>
                }
                onEdit={esAdmin ? () => abrir(n) : undefined}
                onDelete={esAdmin ? () => ed.remove(n, n.nombre_norma) : undefined}
              />
            </td>
          </tr>
        ))}
      </TableShell>

      {ed.modal && (
        <Modal
          title={ed.modal === "nuevo" ? "Nueva norma" : "Editar norma"}
          onClose={() => ed.setModal(null)}
        >
          <form onSubmit={submit} className="flex flex-col gap-space-sm">
            <Field id="id_categoria" label="Categoría" required>
              <select
                id="id_categoria"
                required
                value={form.id_categoria}
                onChange={(e) => setForm((f) => ({ ...f, id_categoria: e.target.value }))}
                className={inputClass}
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>
                    {c.nombre_categoria}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="nombre_norma" label="Nombre de la norma" required>
              <input
                id="nombre_norma"
                required
                value={form.nombre_norma}
                onChange={(e) => setForm((f) => ({ ...f, nombre_norma: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field id="descripcion" label="Descripción">
              <input
                id="descripcion"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-space-xs font-body-md text-body-md">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              />
              Norma activa
            </label>
            <FormFooter error={ed.formError} saving={ed.saving} onCancel={() => ed.setModal(null)} />
          </form>
        </Modal>
      )}

      {verAnalisis && (
        <NormaAnalisisModal norma={verAnalisis} esAdmin={esAdmin} onClose={() => setVerAnalisis(null)} />
      )}
    </Section>
  );
}

/* ---------- Modal: análisis asignados a una norma ---------- */

function NormaAnalisisModal({
  norma,
  esAdmin,
  onClose,
}: {
  norma: Norma;
  esAdmin: boolean;
  onClose: () => void;
}) {
  const loader = useCallback(() => listNormaAnalisis(norma.id_norma), [norma.id_norma]);
  const asignados = useLoad(loader);
  const todos = useLoad(analisisApi.list);

  const [editing, setEditing] = useState<NormaAnalisis | null>(null);
  const [selId, setSelId] = useState("");
  const [tecnica, setTecnica] = useState("");
  const [valor, setValor] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const disponibles = todos.items.filter(
    (a) => a.activo && !asignados.items.some((n) => n.id_analisis === a.id_analisis),
  );
  const opciones: Analisis[] = editing ? [editing.analisis] : disponibles;

  function reset() {
    setEditing(null);
    setSelId("");
    setTecnica("");
    setValor("");
    setFormError(null);
  }

  function editar(n: NormaAnalisis) {
    setEditing(n);
    setSelId(String(n.id_analisis));
    setTecnica(n.tecnica_defecto ?? "");
    setValor(n.valor_referencia_defecto ?? "");
    setFormError(null);
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const datos = {
      tecnica_defecto: tecnica.trim() || null,
      valor_referencia_defecto: valor.trim() || null,
    };
    try {
      if (editing) {
        await updateNormaAnalisis(editing.id_norma_analisis, datos);
      } else {
        await addNormaAnalisis(norma.id_norma, { id_analisis: Number(selId), ...datos });
      }
      reset();
      await asignados.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function quitar(n: NormaAnalisis) {
    if (!window.confirm(`¿Quitar "${n.analisis.nombre_analisis}" de esta norma?`)) return;
    try {
      await removeNormaAnalisis(n.id_norma_analisis);
      if (editing?.id_norma_analisis === n.id_norma_analisis) reset();
      await asignados.reload();
    } catch (err) {
      setFormError(errorMessage(err));
    }
  }

  return (
    <Modal title={`Análisis de: ${norma.nombre_norma}`} onClose={onClose} wide>
      {asignados.error && <ErrorBox message={asignados.error} />}

      <TableShell
        heads={["Análisis", "Técnica", "Valor de referencia", ""]}
        loading={asignados.loading}
        isEmpty={asignados.items.length === 0}
        emptyText="Esta norma todavía no tiene análisis asignados."
      >
        {asignados.items.map((n) => (
          <tr key={n.id_norma_analisis} className="border-t border-surface-variant">
            <td className="px-space-md py-3 font-semibold">{n.analisis.nombre_analisis}</td>
            <td className="px-space-md py-3">{n.tecnica_defecto ?? "—"}</td>
            <td className="px-space-md py-3">{n.valor_referencia_defecto ?? "—"}</td>
            <td className="px-space-md py-3">
              {esAdmin && <RowActions onEdit={() => editar(n)} onDelete={() => quitar(n)} />}
            </td>
          </tr>
        ))}
      </TableShell>

      {esAdmin && (
        <form onSubmit={guardar} className="flex flex-col gap-space-sm bg-surface-container-low rounded-lg p-space-md">
          <h3 className="font-title-md text-title-md text-on-surface font-bold">
            {editing ? "Editar asignación" : "Asignar un análisis"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
            <Field id="sel_analisis" label="Análisis" required>
              <select
                id="sel_analisis"
                required
                disabled={!!editing}
                value={selId}
                onChange={(e) => setSelId(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecciona...</option>
                {opciones.map((a) => (
                  <option key={a.id_analisis} value={a.id_analisis}>
                    {a.nombre_analisis}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="tecnica" label="Técnica">
              <input
                id="tecnica"
                value={tecnica}
                onChange={(e) => setTecnica(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field id="valor" label="Valor de referencia">
              <input
                id="valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          {formError && <ErrorBox message={formError} />}
          <div className="flex justify-end gap-space-sm">
            {editing && (
              <button
                type="button"
                onClick={reset}
                className="font-label-lg text-label-lg bg-surface-container hover:bg-surface-variant text-on-surface px-space-md py-2.5 rounded-lg transition-colors"
              >
                Cancelar edición
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="font-label-lg text-label-lg bg-primary-container hover:bg-primary text-on-primary px-space-md py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Asignar"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

/* ---------- Pestaña: Análisis ---------- */

const emptyAnalisis = {
  nombre_analisis: "",
  descripcion: "",
  metodo_referencia: "",
  unidad_medida_defecto: "",
  activo: true,
};

function AnalisisTab({ esAdmin }: { esAdmin: boolean }) {
  const { items, loading, error, setError, reload } = useLoad(analisisApi.list);
  const ed = useEditor(analisisApi, (a: Analisis) => a.id_analisis, reload, setError);
  const [form, setForm] = useState(emptyAnalisis);

  function abrir(a?: Analisis) {
    setForm(
      a
        ? {
            nombre_analisis: a.nombre_analisis,
            descripcion: a.descripcion ?? "",
            metodo_referencia: a.metodo_referencia ?? "",
            unidad_medida_defecto: a.unidad_medida_defecto ?? "",
            activo: a.activo,
          }
        : emptyAnalisis,
    );
    ed.setFormError(null);
    ed.setModal(a ?? "nuevo");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ed.save({
      nombre_analisis: form.nombre_analisis.trim(),
      descripcion: form.descripcion.trim() || null,
      metodo_referencia: form.metodo_referencia.trim() || null,
      unidad_medida_defecto: form.unidad_medida_defecto.trim() || null,
      activo: form.activo,
    });
  }

  return (
    <Section
      title="Análisis"
      description="Ensayos microbiológicos que realiza el laboratorio."
      onNew={esAdmin ? () => abrir() : undefined}
      error={error}
    >
      <TableShell
        heads={["Análisis", "Método de referencia", "Unidad", "Estado", ""]}
        loading={loading}
        isEmpty={items.length === 0}
        emptyText="Todavía no hay análisis."
      >
        {items.map((a) => (
          <tr key={a.id_analisis} className="border-t border-surface-variant">
            <td className="px-space-md py-3 font-semibold">{a.nombre_analisis}</td>
            <td className="px-space-md py-3">{a.metodo_referencia ?? "—"}</td>
            <td className="px-space-md py-3">{a.unidad_medida_defecto ?? "—"}</td>
            <td className="px-space-md py-3">
              <ActiveBadge activo={a.activo} />
            </td>
            <td className="px-space-md py-3">
              {esAdmin && (
                <RowActions onEdit={() => abrir(a)} onDelete={() => ed.remove(a, a.nombre_analisis)} />
              )}
            </td>
          </tr>
        ))}
      </TableShell>

      {ed.modal && (
        <Modal
          title={ed.modal === "nuevo" ? "Nuevo análisis" : "Editar análisis"}
          onClose={() => ed.setModal(null)}
        >
          <form onSubmit={submit} className="flex flex-col gap-space-sm">
            <Field id="nombre_analisis" label="Nombre" required>
              <input
                id="nombre_analisis"
                required
                value={form.nombre_analisis}
                onChange={(e) => setForm((f) => ({ ...f, nombre_analisis: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field id="metodo_referencia" label="Método de referencia">
              <input
                id="metodo_referencia"
                value={form.metodo_referencia}
                onChange={(e) => setForm((f) => ({ ...f, metodo_referencia: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field id="unidad_medida_defecto" label="Unidad de medida">
              <input
                id="unidad_medida_defecto"
                value={form.unidad_medida_defecto}
                onChange={(e) => setForm((f) => ({ ...f, unidad_medida_defecto: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <Field id="descripcion_analisis" label="Descripción">
              <input
                id="descripcion_analisis"
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                className={inputClass}
              />
            </Field>
            <label className="flex items-center gap-space-xs font-body-md text-body-md">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              />
              Análisis activo
            </label>
            <FormFooter error={ed.formError} saving={ed.saving} onCancel={() => ed.setModal(null)} />
          </form>
        </Modal>
      )}
    </Section>
  );
}

/* ---------- Componente principal ---------- */

type Tab = "categorias" | "normas" | "analisis";

const tabs: { id: Tab; label: string }[] = [
  { id: "categorias", label: "Categorías" },
  { id: "normas", label: "Normas" },
  { id: "analisis", label: "Análisis" },
];

export function CatalogoManager({ rol }: { rol: Usuario["rol"] }) {
  const [tab, setTab] = useState<Tab>("categorias");
  const esAdmin = rol === "Administrador";

  return (
    <div className="flex flex-col gap-space-md max-w-6xl">
      <div>
        <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Catálogo</h1>
        <p className="font-body-md text-body-md text-secondary">
          Categorías, normas y análisis que usa el laboratorio.
          {!esAdmin && " Solo el Administrador puede modificarlo."}
        </p>
      </div>

      <div className="flex gap-1 border-b border-surface-variant">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-label-lg text-label-lg px-space-md py-2.5 -mb-px border-b-2 transition-colors ${
              tab === t.id
                ? "border-primary text-primary"
                : "border-transparent text-secondary hover:text-on-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "categorias" && <CategoriasTab esAdmin={esAdmin} />}
      {tab === "normas" && <NormasTab esAdmin={esAdmin} />}
      {tab === "analisis" && <AnalisisTab esAdmin={esAdmin} />}
    </div>
  );
}