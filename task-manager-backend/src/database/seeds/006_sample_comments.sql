-- ============================================
-- SEED: 006_sample_comments
-- DESCRIPCIÓN: Comentarios en tareas para simular colaboración
-- ============================================

BEGIN;

SET session_replication_role = 'replica';

-- ====================
-- COMENTARIOS EN TAREAS
-- ====================
INSERT INTO task_comments (
    id,
    company_id,
    task_id,
    content,
    content_html,
    mentioned_user_ids,
    created_by,
    created_at
) VALUES
-- Comentario 1: Pregunta sobre requisitos
(
    '19191919-1919-1919-1919-191919191911',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101011', -- Diseñar nuevo dashboard
    '@Ana ¿Podrías clarificar los requisitos para las métricas del dashboard? ¿Necesitamos incluir datos en tiempo real o con actualización diaria es suficiente?',
    '<p><strong>@Ana</strong> ¿Podrías clarificar los requisitos para las métricas del dashboard? ¿Necesitamos incluir datos en tiempo real o con actualización diaria es suficiente?</p>',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1']::uuid[],
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    NOW() - INTERVAL '3 days'
),
-- Comentario 2: Respuesta
(
    '19191919-1919-1919-1919-191919191912',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101011',
    '@Carlos Para la primera versión, actualización diaria es suficiente. Podemos agregar tiempo real en la siguiente iteración. ¿Podrías enfocarte en la usabilidad primero?',
    '<p><strong>@Carlos</strong> Para la primera versión, actualización diaria es suficiente. Podemos agregar tiempo real en la siguiente iteración. ¿Podrías enfocarte en la usabilidad primero?</p>',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2']::uuid[],
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '2 days'
),
-- Comentario 3: Feedback de diseño
(
    '19191919-1919-1919-1919-191919191913',
    '11111111-1111-1111-1111-111111111111',
    '10101010-1010-1010-1010-101010101011',
    'He revisado los wireframes iniciales. Sugiero cambiar la disposición de las métricas para mejorar el flujo visual. ¿@Valeria podrías revisar esto?',
    '<p>He revisado los wireframes iniciales. Sugiero cambiar la disposición de las métricas para mejorar el flujo visual. ¿<strong>@Valeria</strong> podrías revisar esto?</p>',
    ARRAY['17171717-1717-1717-1717-171717171713']::uuid[],
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    NOW() - INTERVAL '1 day'
),
-- Comentario 4: Sobre bug crítico
(
    '19191919-1919-1919-1919-191919191914',
    '11111111-1111-1111-1111-111111111111',
    '12121212-1212-1212-1212-121212121212', -- Bug exportación
    '⚠️ Este bug está afectando a varios clientes. Necesitamos una solución ASAP. He asignado la tarea a @Ana.',
    '<p>⚠️ <strong>Este bug está afectando a varios clientes.</strong> Necesitamos una solución ASAP. He asignado la tarea a <strong>@Ana</strong>.</p>',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1']::uuid[],
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    NOW() - INTERVAL '12 hours'
),
-- Comentario 5: Progreso en bug
(
    '19191919-1919-1919-1919-191919191915',
    '11111111-1111-1111-1111-111111111111',
    '12121212-1212-1212-1212-121212121212',
    'He identificado el problema. Está en la función de serialización de datos grandes. Implementando paginación para la exportación. @Carlos ¿Podrías revisar mi PR?',
    '<p>He identificado el problema. Está en la función de serialización de datos grandes. Implementando paginación para la exportación. <strong>@Carlos</strong> ¿Podrías revisar mi PR?</p>',
    ARRAY['aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2']::uuid[],
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    NOW() - INTERVAL '6 hours'
),
-- Comentario 6: Campaña Google
(
    '19191919-1919-1919-1919-191919191916',
    '22222222-2222-2222-2222-222222222222',
    '13131313-1313-1313-1313-131313131313', -- Banners navideños
    'El cliente ha aprobado los primeros 3 diseños. Necesitamos los últimos 2 para mañana. @Alejandro ¿Cómo vas con los banners restantes?',
    '<p>El cliente ha aprobado los primeros 3 diseños. Necesitamos los últimos 2 para mañana. <strong>@Alejandro</strong> ¿Cómo vas con los banners restantes?</p>',
    ARRAY['23232323-2323-2323-2323-232323232321']::uuid[],
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    NOW() - INTERVAL '1 day'
),
-- Comentario 7: Respuesta diseñador
(
    '19191919-1919-1919-1919-191919191917',
    '22222222-2222-2222-2222-222222222222',
    '13131313-1313-1313-1313-131313131313',
    'Tengo listo el banner 300x600. El 970x250 lo termino esta tarde. ¿@Gabriela podrías revisar el copy para el banner grande?',
    '<p>Tengo listo el banner 300x600. El 970x250 lo termino esta tarde. ¿<strong>@Gabriela</strong> podrías revisar el copy para el banner grande?</p>',
    ARRAY['23232323-2323-2323-2323-232323232322']::uuid[],
    '23232323-2323-2323-2323-232323232321',
    NOW() - INTERVAL '6 hours'
);

-- ====================
-- NOTIFICACIONES (generadas por comentarios)
-- ====================
INSERT INTO notifications (
    id,
    company_id,
    user_id,
    type,
    title,
    message,
    data,
    created_at
) VALUES
-- Notificación para Ana por mención
(
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a01',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'mention',
    'Te han mencionado en un comentario',
    'Carlos te mencionó en "Diseñar nuevo dashboard de analytics"',
    '{"taskId": "10101010-1010-1010-1010-101010101011", "commentId": "19191919-1919-1919-1919-191919191911"}'::jsonb,
    NOW() - INTERVAL '3 days'
),
-- Notificación para Valeria
(
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a02',
    '11111111-1111-1111-1111-111111111111',
    '17171717-1717-1717-1717-171717171713',
    'mention',
    'Te han mencionado en un comentario',
    'Carlos te mencionó en "Diseñar nuevo dashboard de analytics"',
    '{"taskId": "10101010-1010-1010-1010-101010101011", "commentId": "19191919-1919-1919-1919-191919191913"}'::jsonb,
    NOW() - INTERVAL '1 day'
),
-- Notificación para Alejandro
(
    '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a03',
    '22222222-2222-2222-2222-222222222222',
    '23232323-2323-2323-2323-232323232321',
    'mention',
    'Te han mencionado en un comentario',
    'María te mencionó en "Diseñar banners para campaña navideña"',
    '{"taskId": "13131313-1313-1313-1313-131313131313", "commentId": "19191919-1919-1919-1919-191919191916"}'::jsonb,
    NOW() - INTERVAL '1 day'
);

SET session_replication_role = 'origin';

COMMIT;

-- Verificación
SELECT 
    tc.company_id,
    c.name as company_name,
    COUNT(DISTINCT tc.task_id) as tasks_with_comments,
    COUNT(*) as total_comments,
    COUNT(DISTINCT tc.created_by) as unique_commenters,
    AVG(LENGTH(tc.content)) as avg_comment_length
FROM task_comments tc
JOIN companies c ON tc.company_id = c.id
GROUP BY tc.company_id, c.name
ORDER BY c.name;