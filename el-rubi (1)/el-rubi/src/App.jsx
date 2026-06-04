import { useState, useEffect, useCallback, useMemo } from 'react'

/* =====================================================
   PALETA DE MARCA — El Rubí (manual de identidad)
===================================================== */
const C = {
  rubi: '#CC2828', // Rojo Rubí — principal
  terracota: '#A61E1E', // Rojo Terracota — secundario
  rosa: '#F8D7D3', // Rosa Suave — apoyo
  crema: '#F5F1E8', // Crema Natural — fondo
  beige: '#E7DCC2', // Beige Arena — soporte
  beigeOsc: '#D4C9AF',
  blanco: '#FFFFFF',
  texto: '#2C1810',
  textoSuave: '#7A5C4A',
  verde: '#2E7D55',
  verdeClaro: '#C8E6D8',
}

const CATEGORIAS = [
  { v: 'Venta yogur', e: '🥛' },
  { v: 'Venta mermelada', e: '🍓' },
  { v: 'Hospedaje', e: '🏠' },
  { v: 'Materia prima', e: '🌾' },
  { v: 'Transporte', e: '🚗' },
  { v: 'Servicios públicos', e: '💡' },
  { v: 'Empaque', e: '📦' },
  { v: 'Otro', e: '📌' },
]

/* =====================================================
   UTILIDADES
===================================================== */
const formatoPeso = (n) => '$' + Number(n || 0).toLocaleString('es-CO')
const hoyISO = () => new Date().toISOString().split('T')[0]

// Hook simple para persistir estado en localStorage
function useLocalStorage(clave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave)
      return guardado ? JSON.parse(guardado) : inicial
    } catch {
      return inicial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      /* almacenamiento lleno o bloqueado */
    }
  }, [clave, valor])
  return [valor, setValor]
}

/* =====================================================
   APP PRINCIPAL
===================================================== */
export default function App() {
  const [modulo, setModulo] = useState('finanzas')
  const [movimientos, setMovimientos] = useLocalStorage('rubi_movimientos', [])
  const [inventario, setInventario] = useLocalStorage('rubi_inventario', [])
  const [toast, setToast] = useState(null)
  const [aparecer, setAparecer] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAparecer(true), 50)
    return () => clearTimeout(t)
  }, [])

  const mostrarToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2400)
  }, [])

  return (
    <div style={S.body}>
      <EstilosGlobales />

      <Header />
      <Nav modulo={modulo} setModulo={setModulo} />

      <main
        style={{
          ...S.main,
          opacity: aparecer ? 1 : 0,
          transform: aparecer ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)',
        }}
      >
        {modulo === 'finanzas' && (
          <Finanzas
            movimientos={movimientos}
            setMovimientos={setMovimientos}
            mostrarToast={mostrarToast}
          />
        )}
        {modulo === 'inventario' && (
          <Inventario
            inventario={inventario}
            setInventario={setInventario}
            mostrarToast={mostrarToast}
          />
        )}
        {modulo === 'ayuda' && <Ayuda />}
      </main>

      {/* Toast de notificación */}
      <div
        style={{
          ...S.toast,
          transform: toast
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(90px)',
        }}
      >
        {toast}
      </div>
    </div>
  )
}

/* =====================================================
   ENCABEZADO — sello e identidad El Rubí
===================================================== */
function Header() {
  return (
    <header style={S.header}>
      <div style={S.headerCirculo1} />
      <div style={S.headerCirculo2} />
      <div style={S.headerLogo}>
        <svg
          style={{ width: 64, height: 28, marginBottom: 2, opacity: 0.95 }}
          viewBox="0 0 100 40"
          fill="none"
        >
          <polyline
            points="0,38 18,8 36,28 50,4 64,28 82,8 100,38"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M0,38 Q12,33 25,36 Q38,39 50,35 Q62,31 75,35 Q88,39 100,36"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
        <span style={S.headerEl}>El</span>
        <span style={S.headerRubi}>Rubí</span>
        <span style={S.headerSub}>Finca Hospedaje &amp; Productos Artesanales</span>
      </div>
    </header>
  )
}

/* =====================================================
   NAVEGACIÓN
===================================================== */
function Nav({ modulo, setModulo }) {
  const tabs = [
    { id: 'finanzas', label: '💰 Finanzas' },
    { id: 'inventario', label: '📦 Inventario' },
    { id: 'ayuda', label: '❓ Ayuda' },
  ]
  return (
    <nav style={S.nav}>
      {tabs.map((t) => {
        const activo = modulo === t.id
        return (
          <button
            key={t.id}
            onClick={() => setModulo(t.id)}
            style={{
              ...S.navBtn,
              color: activo ? C.rubi : C.textoSuave,
              borderBottomColor: activo ? C.rubi : 'transparent',
              background: activo ? C.crema : 'transparent',
            }}
          >
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}

/* =====================================================
   MÓDULO 1 — FINANZAS
===================================================== */
function Finanzas({ movimientos, setMovimientos, mostrarToast }) {
  const [form, setForm] = useState({
    fecha: hoyISO(),
    tipo: 'Ingreso',
    categoria: 'Venta yogur',
    monto: '',
    descripcion: '',
  })
  const [filtros, setFiltros] = useState({ tipo: '', categoria: '', mes: '' })

  const totales = useMemo(() => {
    const ingresos = movimientos
      .filter((m) => m.tipo === 'Ingreso')
      .reduce((s, m) => s + m.monto, 0)
    const egresos = movimientos
      .filter((m) => m.tipo === 'Egreso')
      .reduce((s, m) => s + m.monto, 0)
    return { ingresos, egresos, utilidad: ingresos - egresos }
  }, [movimientos])

  const filtrados = useMemo(() => {
    return movimientos.filter((m) => {
      if (filtros.tipo && m.tipo !== filtros.tipo) return false
      if (filtros.categoria && m.categoria !== filtros.categoria) return false
      if (filtros.mes && !m.fecha.startsWith(filtros.mes)) return false
      return true
    })
  }, [movimientos, filtros])

  const agregar = () => {
    const monto = parseFloat(form.monto)
    if (!form.fecha) return alert('Por favor seleccione una fecha.')
    if (!monto || monto <= 0)
      return alert('Por favor ingrese un monto válido mayor a cero.')

    const nuevo = {
      id: Date.now(),
      fecha: form.fecha,
      tipo: form.tipo,
      categoria: form.categoria,
      monto,
      descripcion: form.descripcion.trim() || form.categoria,
    }
    setMovimientos([nuevo, ...movimientos])
    setForm({ ...form, monto: '', descripcion: '' })
    mostrarToast('✓ Registro guardado')
  }

  const eliminar = (id) => {
    if (!confirm('¿Está segura de que desea eliminar este registro?')) return
    setMovimientos(movimientos.filter((m) => m.id !== id))
    mostrarToast('🗑️ Registro eliminado')
  }

  const borrarTodo = () => {
    if (
      !confirm(
        '⚠️ ¿Está segura de que desea borrar TODOS los registros financieros? Esta acción no se puede deshacer.'
      )
    )
      return
    setMovimientos([])
    mostrarToast('🗑️ Todos los registros borrados')
  }

  const exportarCSV = () => {
    if (movimientos.length === 0) return alert('No hay registros para exportar.')
    const enc = ['Fecha', 'Descripcion', 'Tipo', 'Categoria', 'Monto']
    const filas = movimientos.map((m) =>
      [m.fecha, `"${m.descripcion}"`, m.tipo, m.categoria, m.monto].join(',')
    )
    const csv = [enc.join(','), ...filas].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rubi_finanzas_${hoyISO()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* Tarjetas de resumen */}
      <div style={S.resumenGrid}>
        <ResumenCard
          etiqueta="📈 Ingresos"
          valor={totales.ingresos}
          bg={C.verdeClaro}
          color={C.verde}
          borde="#A8D5BF"
        />
        <ResumenCard
          etiqueta="📉 Egresos"
          valor={totales.egresos}
          bg={C.rosa}
          color={C.terracota}
          borde="#EBB0AB"
        />
        <ResumenCard
          etiqueta="✨ Utilidad"
          valor={totales.utilidad}
          bg={C.beige}
          color={C.terracota}
          borde={C.beigeOsc}
        />
      </div>

      {/* Formulario */}
      <div style={S.tarjeta}>
        <h2 style={S.h2}>➕ Registrar movimiento</h2>
        <div style={S.formGrid}>
          <Campo label="📅 Fecha">
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              style={S.input}
            />
          </Campo>
          <Campo label="Tipo">
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              style={S.input}
            >
              <option value="Ingreso">💚 Ingreso</option>
              <option value="Egreso">🔴 Egreso</option>
            </select>
          </Campo>
          <Campo label="Categoría">
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              style={S.input}
            >
              {CATEGORIAS.map((c) => (
                <option key={c.v} value={c.v}>
                  {c.e} {c.v}
                </option>
              ))}
            </select>
          </Campo>
          <Campo label="💵 Monto ($)">
            <input
              type="number"
              min="0"
              step="50"
              placeholder="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              style={S.input}
            />
          </Campo>
          <div style={{ gridColumn: '1 / -1' }}>
            <Campo label="Descripción (opcional)">
              <input
                type="text"
                placeholder="Ej: Venta mercado del sábado"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                style={S.input}
              />
            </Campo>
          </div>
        </div>
        <Boton variante="primario" full onClick={agregar} style={{ marginTop: 8 }}>
          ✅ Guardar registro
        </Boton>
      </div>

      {/* Tabla */}
      <div style={S.tarjeta}>
        <h2 style={S.h2}>📋 Mis registros</h2>

        <div style={S.filtros}>
          <select
            value={filtros.tipo}
            onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            style={{ ...S.input, flex: 1, minWidth: 140 }}
          >
            <option value="">Todos los tipos</option>
            <option value="Ingreso">💚 Ingresos</option>
            <option value="Egreso">🔴 Egresos</option>
          </select>
          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
            style={{ ...S.input, flex: 1, minWidth: 140 }}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS.map((c) => (
              <option key={c.v} value={c.v}>
                {c.v}
              </option>
            ))}
          </select>
          <input
            type="month"
            value={filtros.mes}
            onChange={(e) => setFiltros({ ...filtros, mes: e.target.value })}
            style={{ ...S.input, flex: 1, minWidth: 140 }}
          />
        </div>

        <div style={S.barraAcciones}>
          <Boton variante="verde" icono onClick={exportarCSV}>
            ⬇️ Exportar CSV
          </Boton>
          <Boton variante="peligro" icono onClick={borrarTodo}>
            🗑️ Borrar todo
          </Boton>
        </div>

        <div style={S.tablaContenedor}>
          <table style={S.tabla}>
            <thead>
              <tr style={{ background: C.crema }}>
                {['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto', 'Acción'].map(
                  (h) => (
                    <th key={h} style={S.th}>
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={S.vacio}>
                    <span style={S.vacioIcono}>📒</span>
                    <p style={S.vacioTexto}>
                      Aún no hay registros.
                      <br />
                      ¡Agregue su primer movimiento arriba!
                    </p>
                  </td>
                </tr>
              ) : (
                filtrados.map((m) => (
                  <tr key={m.id}>
                    <td style={S.td}>{m.fecha}</td>
                    <td style={S.td}>{m.descripcion}</td>
                    <td style={{ ...S.td, whiteSpace: 'nowrap' }}>{m.categoria}</td>
                    <td style={S.td}>
                      <span
                        style={{
                          ...S.badge,
                          background: m.tipo === 'Ingreso' ? C.verdeClaro : C.rosa,
                          color: m.tipo === 'Ingreso' ? C.verde : C.terracota,
                        }}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td
                      style={{
                        ...S.td,
                        fontWeight: 700,
                        color: m.tipo === 'Ingreso' ? C.verde : C.rubi,
                      }}
                    >
                      {formatoPeso(m.monto)}
                    </td>
                    <td style={S.td}>
                      <Boton variante="peligro" icono onClick={() => eliminar(m.id)}>
                        🗑
                      </Boton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function ResumenCard({ etiqueta, valor, bg, color, borde }) {
  return (
    <div
      style={{
        ...S.resumenItem,
        background: bg,
        color,
        borderColor: borde,
      }}
    >
      <div style={S.resumenEtiqueta}>{etiqueta}</div>
      <div style={S.resumenValor}>{formatoPeso(valor)}</div>
    </div>
  )
}

/* =====================================================
   MÓDULO 2 — INVENTARIO
===================================================== */
function Inventario({ inventario, setInventario, mostrarToast }) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [indiceEdit, setIndiceEdit] = useState(-1)
  const [form, setForm] = useState({
    producto: '',
    cantidad: '',
    costoUnit: '',
    precioVenta: '',
  })

  const valorTotal = useMemo(
    () => inventario.reduce((s, p) => s + p.cantidad * p.costoUnit, 0),
    [inventario]
  )

  const abrirModal = (indice = -1) => {
    setIndiceEdit(indice)
    if (indice === -1) {
      setForm({ producto: '', cantidad: '', costoUnit: '', precioVenta: '' })
    } else {
      const p = inventario[indice]
      setForm({
        producto: p.producto,
        cantidad: String(p.cantidad),
        costoUnit: String(p.costoUnit),
        precioVenta: String(p.precioVenta),
      })
    }
    setModalAbierto(true)
  }

  const guardar = () => {
    const producto = form.producto.trim()
    const cantidad = parseFloat(form.cantidad)
    const costoUnit = parseFloat(form.costoUnit)
    const precioVenta = parseFloat(form.precioVenta)

    if (!producto) return alert('Por favor escriba el nombre del producto.')
    if (isNaN(cantidad) || cantidad < 0)
      return alert('Por favor ingrese una cantidad válida.')
    if (isNaN(costoUnit) || costoUnit < 0)
      return alert('Por favor ingrese un costo válido.')
    if (isNaN(precioVenta) || precioVenta < 0)
      return alert('Por favor ingrese un precio válido.')

    const item = { producto, cantidad, costoUnit, precioVenta }
    if (indiceEdit === -1) {
      setInventario([...inventario, item])
    } else {
      const copia = [...inventario]
      copia[indiceEdit] = item
      setInventario(copia)
    }
    setModalAbierto(false)
    mostrarToast('✓ Producto guardado')
  }

  const eliminar = (indice) => {
    if (!confirm('¿Está segura de que desea eliminar este producto?')) return
    setInventario(inventario.filter((_, i) => i !== indice))
    mostrarToast('🗑️ Producto eliminado')
  }

  return (
    <>
      {/* Banner valor total */}
      <div style={S.bannerInv}>
        <div>
          <div style={S.bannerEtiqueta}>Valor total del inventario</div>
          <div style={S.bannerNumero}>{formatoPeso(valorTotal)}</div>
        </div>
        <div style={S.invIcon}>🫙</div>
      </div>

      <div style={S.tarjeta}>
        <h2 style={S.h2}>📦 Mis productos</h2>
        <div style={{ marginBottom: 18 }}>
          <Boton variante="primario" onClick={() => abrirModal()}>
            ➕ Agregar producto
          </Boton>
        </div>
        <div style={S.tablaContenedor}>
          <table style={S.tabla}>
            <thead>
              <tr style={{ background: C.crema }}>
                {[
                  'Producto',
                  'Cantidad',
                  'Costo unit.',
                  'Precio venta',
                  'Valor total',
                  'Acciones',
                ].map((h) => (
                  <th key={h} style={S.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventario.length === 0 ? (
                <tr>
                  <td colSpan={6} style={S.vacio}>
                    <span style={S.vacioIcono}>🫙</span>
                    <p style={S.vacioTexto}>
                      No hay productos registrados.
                      <br />
                      ¡Haga clic en "Agregar producto"!
                    </p>
                  </td>
                </tr>
              ) : (
                inventario.map((p, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <strong>{p.producto}</strong>
                    </td>
                    <td style={S.td}>{p.cantidad}</td>
                    <td style={S.td}>{formatoPeso(p.costoUnit)}</td>
                    <td style={S.td}>{formatoPeso(p.precioVenta)}</td>
                    <td style={S.td}>{formatoPeso(p.cantidad * p.costoUnit)}</td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Boton variante="secundario" icono onClick={() => abrirModal(i)}>
                          ✏️
                        </Boton>
                        <Boton variante="peligro" icono onClick={() => eliminar(i)}>
                          🗑
                        </Boton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <div
          style={S.overlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalAbierto(false)
          }}
        >
          <div style={S.modal}>
            <h3 style={S.modalTitulo}>
              {indiceEdit === -1 ? 'Agregar producto' : 'Editar producto'}
            </h3>
            <div style={{ marginBottom: 14 }}>
              <Campo label="Nombre del producto">
                <input
                  type="text"
                  placeholder="Ej: Yogur de fresa 200ml"
                  value={form.producto}
                  onChange={(e) => setForm({ ...form, producto: e.target.value })}
                  style={S.input}
                />
              </Campo>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Campo label="Cantidad en inventario">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.cantidad}
                  onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
                  style={S.input}
                />
              </Campo>
            </div>
            <div style={{ marginBottom: 14 }}>
              <Campo label="Costo unitario ($)">
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={form.costoUnit}
                  onChange={(e) => setForm({ ...form, costoUnit: e.target.value })}
                  style={S.input}
                />
              </Campo>
            </div>
            <div>
              <Campo label="Precio de venta ($)">
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="0"
                  value={form.precioVenta}
                  onChange={(e) => setForm({ ...form, precioVenta: e.target.value })}
                  style={S.input}
                />
              </Campo>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <Boton variante="primario" full onClick={guardar}>
                ✅ Guardar
              </Boton>
              <Boton variante="peligro" full onClick={() => setModalAbierto(false)}>
                ✖ Cancelar
              </Boton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* =====================================================
   MÓDULO 3 — AYUDA
===================================================== */
function Ayuda() {
  const pasos = [
    {
      t: 'Registre cada ingreso o egreso en Finanzas',
      p: 'Cada vez que venda yogures, mermeladas u ofrezca hospedaje, ingrese el monto. Lo mismo cuando gaste en materias primas, transporte, etc. Haga clic en "Guardar registro" y listo.',
    },
    {
      t: 'Revise sus totales en las tarjetas de colores',
      p: 'Las tres tarjetas en la parte de arriba le muestran cuánto ha ganado (Ingresos), cuánto ha gastado (Egresos) y cuánta plata le quedó (Utilidad).',
    },
    {
      t: 'Filtre por mes o tipo para ver períodos específicos',
      p: 'Use los filtros de la parte superior de la tabla para ver solo los ingresos, solo los egresos, o filtrar por mes específico.',
    },
    {
      t: 'Controle su inventario en el módulo Inventario',
      p: 'Agregue cada producto que tenga: yogur de fresa, mermelada de mora, etc. Ingrese cuántas unidades tiene, cuánto le costó hacerlas y a cuánto las vende. La app calcula el valor total automáticamente.',
    },
    {
      t: 'Sus datos se guardan solos — ¡no los perderá!',
      p: 'Todo se guarda automáticamente en el navegador que usa para abrir esta página. Si borra el historial del navegador, los datos se perderán. Recomendamos exportar el CSV una vez al mes como respaldo.',
    },
    {
      t: 'Exporte sus registros para guardarlos',
      p: 'Haga clic en "⬇️ Exportar CSV" en el módulo de Finanzas para descargar un archivo que puede abrir en Excel o Google Sheets.',
    },
  ]
  return (
    <div style={S.tarjeta}>
      <h2 style={S.h2}>📖 ¿Cómo usar esta herramienta?</h2>
      <div style={S.divider}>✦ &nbsp; Guía paso a paso &nbsp; ✦</div>
      {pasos.map((paso, i) => (
        <div
          key={i}
          style={{
            ...S.ayudaPaso,
            borderBottom: i === pasos.length - 1 ? 'none' : `1px solid ${C.beige}`,
          }}
        >
          <div style={S.ayudaNumero}>{i + 1}</div>
          <div>
            <strong style={S.ayudaStrong}>{paso.t}</strong>
            <p style={S.ayudaP}>{paso.p}</p>
          </div>
        </div>
      ))}
      <div style={{ height: 1, background: C.beige, margin: '16px 0' }} />
      <p style={S.ayudaCierre}>
        ✦ &nbsp;Registre los movimientos al final de cada día, como si estuviera
        anotando en su cuaderno.
        <br />
        Con constancia, en un mes tendrá una visión clara de cómo va su negocio. ¡Éxito,
        El Rubí!&nbsp; ✦
      </p>
    </div>
  )
}

/* =====================================================
   COMPONENTES REUTILIZABLES
===================================================== */
function Campo({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  )
}

function Boton({ variante = 'primario', icono = false, full = false, children, style, ...props }) {
  const base = { ...S.btn, ...(icono ? S.btnIcono : {}), ...(full ? { flex: 1, width: '100%' } : {}) }
  const variantes = {
    primario: { background: C.rubi, color: C.blanco, boxShadow: '0 4px 14px rgba(204,40,40,0.28)' },
    secundario: { background: C.beige, color: C.terracota, border: `1.5px solid ${C.beigeOsc}` },
    peligro: { background: 'transparent', color: C.rubi, border: `1.5px solid ${C.rubi}` },
    verde: { background: C.verde, color: C.blanco, boxShadow: '0 4px 12px rgba(46,125,85,0.25)' },
  }
  return (
    <button style={{ ...base, ...variantes[variante], ...style }} {...props}>
      {children}
    </button>
  )
}

/* =====================================================
   ESTILOS GLOBALES (resets + responsive + scrollbar)
===================================================== */
function EstilosGlobales() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Lato', sans-serif; background: ${C.crema}; color: ${C.texto}; }
      input, select { -webkit-appearance: none; appearance: none; }
      input:focus, select:focus {
        outline: none; border-color: ${C.rubi} !important; background: ${C.blanco} !important;
        box-shadow: 0 0 0 3px rgba(204,40,40,0.08);
      }
      button { cursor: pointer; transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s, background 0.15s; }
      button:active { transform: scale(0.97); }
      tr:hover td { background: #FAF6F0; }
      ::-webkit-scrollbar { height: 8px; width: 8px; }
      ::-webkit-scrollbar-thumb { background: ${C.beigeOsc}; border-radius: 4px; }
      @media (max-width: 520px) {
        .form-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  )
}

/* =====================================================
   OBJETO DE ESTILOS INLINE
===================================================== */
const S = {
  body: { minHeight: '100vh' },

  header: {
    background: `linear-gradient(160deg, ${C.rubi} 0%, ${C.terracota} 100%)`,
    color: C.blanco,
    padding: '28px 20px 24px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerCirculo1: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(260px, 80vw)',
    height: 'min(260px, 80vw)',
    border: '2px solid rgba(255,255,255,0.12)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  headerCirculo2: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(240px, 74vw)',
    height: 'min(240px, 74vw)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  headerLogo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    position: 'relative',
    zIndex: 1,
  },
  headerEl: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(0.75rem, 2.5vw, 0.95rem)',
    fontWeight: 600,
    letterSpacing: 6,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  headerRubi: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(3rem, 10vw, 4.5rem)',
    lineHeight: 1,
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  headerSub: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(0.6rem, 2vw, 0.72rem)',
    fontWeight: 400,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    opacity: 0.75,
    marginTop: 4,
  },

  nav: {
    display: 'flex',
    background: C.blanco,
    borderBottom: `3px solid ${C.beige}`,
    boxShadow: '0 2px 12px rgba(166,30,30,0.07)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  navBtn: {
    flex: 1,
    padding: '15px 8px',
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(0.72rem, 2.5vw, 0.85rem)',
    fontWeight: 600,
    letterSpacing: 0.5,
    border: 'none',
    borderBottom: '3px solid transparent',
    marginBottom: -3,
  },

  main: { maxWidth: 920, margin: '0 auto', padding: '26px 16px 70px' },

  tarjeta: {
    background: C.blanco,
    borderRadius: 14,
    boxShadow: '0 2px 12px rgba(166,30,30,0.08)',
    padding: 24,
    marginBottom: 22,
    border: `1px solid ${C.beige}`,
  },
  h2: {
    fontFamily: "'Cinzel', serif",
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.rubi,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottom: `1px solid ${C.rosa}`,
  },

  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  label: {
    display: 'block',
    fontFamily: "'Cinzel', serif",
    fontWeight: 600,
    fontSize: '0.75rem',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: C.textoSuave,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: `1.5px solid ${C.beige}`,
    borderRadius: 10,
    fontFamily: "'Lato', sans-serif",
    fontSize: '1rem',
    color: C.texto,
    background: C.crema,
  },

  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '13px 22px',
    border: 'none',
    borderRadius: 10,
    fontFamily: "'Cinzel', serif",
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: 0.5,
    minHeight: 48,
    textTransform: 'uppercase',
  },
  btnIcono: { padding: '8px 14px', fontSize: '0.78rem', minHeight: 38, borderRadius: 8 },

  resumenGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 14,
    marginBottom: 22,
  },
  resumenItem: {
    borderRadius: 14,
    padding: '20px 16px',
    textAlign: 'center',
    border: '1px solid transparent',
  },
  resumenEtiqueta: {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.7,
    marginBottom: 8,
  },
  resumenValor: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
    lineHeight: 1.1,
  },

  filtros: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  barraAcciones: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 },

  tablaContenedor: {
    overflowX: 'auto',
    borderRadius: 10,
    border: `1px solid ${C.beige}`,
  },
  tabla: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
  th: {
    padding: '12px 14px',
    textAlign: 'left',
    fontFamily: "'Cinzel', serif",
    fontWeight: 600,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: C.textoSuave,
    whiteSpace: 'nowrap',
  },
  td: { padding: '12px 14px', borderTop: `1px solid ${C.crema}`, verticalAlign: 'middle' },
  badge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: 20,
    fontFamily: "'Cinzel', serif",
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  vacio: { textAlign: 'center', padding: '48px 20px', color: C.textoSuave },
  vacioIcono: { fontSize: '2.8rem', display: 'block', marginBottom: 12, opacity: 0.5 },
  vacioTexto: { fontFamily: "'Cinzel', serif", fontSize: '0.85rem', letterSpacing: 0.5 },

  bannerInv: {
    background: `linear-gradient(135deg, ${C.rubi} 0%, ${C.terracota} 100%)`,
    color: C.blanco,
    borderRadius: 14,
    padding: '22px 26px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    boxShadow: '0 6px 20px rgba(204,40,40,0.22)',
  },
  bannerEtiqueta: {
    fontFamily: "'Cinzel', serif",
    fontSize: '0.75rem',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: 4,
  },
  bannerNumero: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(2rem, 6vw, 2.6rem)',
    lineHeight: 1.1,
  },
  invIcon: {
    width: 54,
    height: 54,
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    flexShrink: 0,
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(44,24,16,0.55)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    background: C.blanco,
    borderRadius: 14,
    padding: '30px 26px',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
    borderTop: `4px solid ${C.rubi}`,
  },
  modalTitulo: {
    fontFamily: "'Cinzel', serif",
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.rubi,
    marginBottom: 20,
  },

  ayudaPaso: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
  },
  ayudaNumero: {
    background: C.rubi,
    color: C.blanco,
    borderRadius: '50%',
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    fontSize: '0.9rem',
    flexShrink: 0,
    boxShadow: '0 3px 10px rgba(204,40,40,0.25)',
  },
  ayudaStrong: {
    display: 'block',
    fontFamily: "'Cinzel', serif",
    fontSize: '0.82rem',
    letterSpacing: 0.5,
    color: C.terracota,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ayudaP: { fontSize: '0.92rem', color: C.textoSuave, lineHeight: 1.6 },
  ayudaCierre: {
    fontSize: '0.88rem',
    color: C.textoSuave,
    lineHeight: 1.7,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '4px 8px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    margin: '6px 0 20px',
    color: C.beigeOsc,
    fontSize: '0.7rem',
    letterSpacing: 2,
  },

  toast: {
    position: 'fixed',
    bottom: 28,
    left: '50%',
    background: C.terracota,
    color: C.blanco,
    padding: '13px 28px',
    borderRadius: 30,
    fontFamily: "'Cinzel', serif",
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: 0.5,
    zIndex: 999,
    transition: 'transform 0.35s cubic-bezier(.34,1.56,.64,1)',
    boxShadow: '0 6px 24px rgba(166,30,30,0.3)',
  },
}
