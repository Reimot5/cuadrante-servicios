import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const nombresGrupoA = [
  'Ana Martínez',
  'Carlos Rodríguez',
  'Laura González',
  'Miguel Fernández',
  'Patricia López',
  'Roberto Sánchez',
  'Elena Torres',
  'Francisco Ramírez',
];

const nombresGrupoB = [
  'Diego Castro',
  'Lucía Morales', 
  'Javier Ortiz',
  'Carmen Ruiz', // Conductora
  'Andrés Jiménez',
  'María Herrera',
  'Pedro Navarro',
  'Isabel Domínguez', // Conductora
  'Luis Vega',
  'Sofía Romero',
  'Jorge Mendoza',
  'Beatriz Silva', // Conductora
  'Manuel Reyes',
  'Victoria Flores',
  'Alberto Cruz',
  'Claudia Vargas',
  'Raúl Peña',
  'Natalia Guerrero',
  'Sergio Medina',
  'Gabriela Campos',
  'Fernando Cortés',
  'Adriana Ramos',
];

async function main() {
  console.log('🌱 Iniciando seed de base de datos...');

  // Limpiar base de datos
  await prisma.auditLog.deleteMany();
  await prisma.asignacion.deleteMany();
  await prisma.periodo.deleteMany();
  await prisma.reglaConfigurable.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.user.deleteMany();

  // 1. Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      rol: 'ADMIN',
    },
  });
  console.log('✅ Usuario admin creado (username: admin, password: admin123)');

  // 2. Crear personas del Grupo A (todas conductores)
  const personasGrupoA = [];
  for (const nombre of nombresGrupoA) {
    const persona = await prisma.persona.create({
      data: {
        nombre,
        grupo: 'A',
        isConductor: true,
      },
    });
    personasGrupoA.push(persona);
  }
  console.log(`✅ ${personasGrupoA.length} personas del Grupo A creadas (todas conductores)`);

  // 3. Crear personas del Grupo B (solo 3 conductores)
  const personasGrupoB = [];
  const conductoresGrupoB = [3, 7, 11]; // Índices de conductores

  for (let i = 0; i < nombresGrupoB.length; i++) {
    const persona = await prisma.persona.create({
      data: {
        nombre: nombresGrupoB[i],
        grupo: 'B',
        isConductor: conductoresGrupoB.includes(i),
      },
    });
    personasGrupoB.push(persona);
  }
  const totalConductoresB = personasGrupoB.filter((p) => p.isConductor).length;
  console.log(
    `✅ ${personasGrupoB.length} personas del Grupo B creadas (${totalConductoresB} conductores)`
  );

  // 4. Crear reglas configurables
  await prisma.reglaConfigurable.createMany({
    data: [
      {
        estadoTrigger: 'C',
        diasDescanso: 2,
        estadoDescanso: 'X',
        prioridad: 1,
        activa: true,
        descripcion: 'Después de Comisión, 2 días bloqueados',
      },
      {
        estadoTrigger: 'S',
        diasDescanso: 2,
        estadoDescanso: 'X',
        prioridad: 1,
        activa: true,
        descripcion: 'Después de Semana, 2 días bloqueados',
      },
    ],
  });
  console.log('✅ Reglas configurables creadas');

  // 5. Crear asignaciones de ejemplo (mes actual)
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  const todasLasPersonas = [...personasGrupoA, ...personasGrupoB];

  // Crear algunas licencias, comisiones, partes de enfermo
  const ejemplosAsignaciones = [
    // Licencias
    {
      personaId: personasGrupoB[0].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 5),
      estado: 'LIC',
      nota: 'Licencia ordinaria',
    },
    {
      personaId: personasGrupoB[2].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 12),
      estado: 'LIC',
      nota: 'Licencia ordinaria',
    },
    // Comisiones
    {
      personaId: personasGrupoA[1].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 8),
      estado: 'C',
      nota: 'Comisión de servicio',
    },
    {
      personaId: personasGrupoA[1].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 9),
      estado: 'C',
      nota: 'Comisión de servicio',
    },
    // Bloqueados automáticos después de comisión (días 10 y 11)
    {
      personaId: personasGrupoA[1].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 10),
      estado: 'X',
      nota: 'Descanso automático después de C',
    },
    {
      personaId: personasGrupoA[1].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 11),
      estado: 'X',
      nota: 'Descanso automático después de C',
    },
    // Semanas
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 15),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 16),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 17),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 18),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 19),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 20),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 21),
      estado: 'S',
      nota: 'Semana de descanso',
    },
    // Bloqueados automáticos después de semana (días 22 y 23)
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 22),
      estado: 'X',
      nota: 'Descanso automático después de S',
    },
    {
      personaId: personasGrupoB[5].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 23),
      estado: 'X',
      nota: 'Descanso automático después de S',
    },
    // Parte enfermo
    {
      personaId: personasGrupoB[8].id,
      fecha: new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 20),
      estado: 'PE',
      nota: 'Parte de enfermo',
    },
  ];

  for (const asig of ejemplosAsignaciones) {
    await prisma.asignacion.create({
      data: {
        ...asig,
        origen: asig.nota?.includes('automático') ? 'auto' : 'manual',
      },
    });
  }

  console.log(`✅ ${ejemplosAsignaciones.length} asignaciones de ejemplo creadas`);

  // 6. Crear un período de ejemplo
  await prisma.periodo.create({
    data: {
      fechaInicio: inicioMes,
      fechaFin: finMes,
      estado: 'BORRADOR',
      createdBy: 'admin',
    },
  });
  console.log('✅ Período de ejemplo creado');

  // 7. Crear registro de audit log inicial
  await prisma.auditLog.create({
    data: {
      usuario: 'sistema',
      accion: 'SEED_DATABASE',
      detalle: JSON.stringify({
        personasCreadas: todasLasPersonas.length,
        grupoA: personasGrupoA.length,
        grupoB: personasGrupoB.length,
        asignaciones: ejemplosAsignaciones.length,
      }),
    },
  });
  console.log('✅ Audit log inicial creado');

  console.log('\n🎉 Seed completado exitosamente!');
  console.log(`📊 Total de personas: ${todasLasPersonas.length}`);
  console.log(`   - Grupo A: ${personasGrupoA.length} (todas conductores)`);
  console.log(`   - Grupo B: ${personasGrupoB.length} (${totalConductoresB} conductores)`);
  console.log(`\n🔐 Credenciales de acceso:`);
  console.log(`   Usuario: admin`);
  console.log(`   Contraseña: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

