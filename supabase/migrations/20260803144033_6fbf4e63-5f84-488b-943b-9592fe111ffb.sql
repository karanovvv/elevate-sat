
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  current_level text,
  target_score integer,
  exam_date date,
  daily_minutes integer,
  onboarded boolean NOT NULL DEFAULT false,
  streak_days integer NOT NULL DEFAULT 0,
  last_practice_date date,
  notifications_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL,
  passage text,
  prompt text NOT NULL,
  choices jsonb NOT NULL,
  correct_index integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions readable" ON public.questions FOR SELECT TO authenticated USING (true);

CREATE TABLE public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_index integer NOT NULL,
  is_correct boolean NOT NULL,
  seconds_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_attempts TO authenticated;
GRANT ALL ON public.question_attempts TO service_role;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts" ON public.question_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Practice',
  math_score integer NOT NULL DEFAULT 200,
  rw_score integer NOT NULL DEFAULT 200,
  total_score integer NOT NULL DEFAULT 400,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_attempts TO authenticated;
GRANT ALL ON public.test_attempts TO service_role;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tests" ON public.test_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.questions (section, topic, difficulty, passage, prompt, choices, correct_index, explanation) VALUES
('math','Algebra','Easy',NULL,'Если 3x + 5 = 20, чему равен x?','["3","5","7","15"]'::jsonb,1,'Вычитаем 5: 3x = 15. Делим на 3: x = 5.'),
('math','Algebra','Easy',NULL,'Решите: 2(x − 4) = 10','["5","7","9","14"]'::jsonb,2,'Раскрываем скобки: 2x − 8 = 10, значит 2x = 18 и x = 9.'),
('math','Algebra','Easy',NULL,'Решите: 4x + 1 = x + 10','["2","3","4","9"]'::jsonb,1,'Переносим x влево: 3x + 1 = 10, 3x = 9, x = 3.'),
('math','Algebra','Medium',NULL,'Чему равен наклон прямой, проходящей через точки (0, 3) и (2, 7)?','["1","2","3","4"]'::jsonb,1,'Наклон = (7 − 3) / (2 − 0) = 4/2 = 2.'),
('math','Algebra','Medium',NULL,'Для функции y = 4x − 1 найдите y при x = 3.','["10","11","12","13"]'::jsonb,1,'y = 4·3 − 1 = 12 − 1 = 11.'),
('math','Algebra','Medium',NULL,'Система: x + y = 10 и x − y = 4. Чему равен x?','["5","6","7","8"]'::jsonb,2,'Сложим уравнения: 2x = 14, значит x = 7 (и y = 3).'),
('math','Algebra','Medium',NULL,'f(x) = 2x + 3. Если f(a) = 13, чему равно a?','["4","5","6","7"]'::jsonb,1,'2a + 3 = 13 → 2a = 10 → a = 5.'),
('math','Algebra','Medium',NULL,'Решите неравенство: 5 − 2x > 1','["x < 2","x > 2","x < 3","x > −2"]'::jsonb,0,'−2x > −4. Делим на −2 и меняем знак неравенства: x < 2.'),
('math','Algebra','Hard',NULL,'В какой точке прямая 3x − 2y = 12 пересекает ось x?','["(4, 0)","(0, −6)","(−4, 0)","(0, 6)"]'::jsonb,0,'На оси x y = 0: 3x = 12, x = 4. Точка (4, 0).'),
('math','Algebra','Hard',NULL,'Чему равна сумма решений уравнения |2x − 6| = 10?','["6","8","10","−2"]'::jsonb,0,'2x − 6 = 10 → x = 8; 2x − 6 = −10 → x = −2. Сумма: 8 + (−2) = 6.'),
('math','Advanced Math','Easy',NULL,'Раскройте: (x + 2)(x − 5)','["x² − 3x − 10","x² + 3x − 10","x² − 7x + 10","x² − 3x + 10"]'::jsonb,0,'x·x = x², x·(−5) + 2·x = −3x, 2·(−5) = −10.'),
('math','Advanced Math','Easy',NULL,'f(x) = x² − 4x. Чему равно f(−2)?','["4","8","12","−12"]'::jsonb,2,'f(−2) = 4 − (−8) = 4 + 8 = 12.'),
('math','Advanced Math','Medium',NULL,'Найдите корни уравнения x² − 5x + 6 = 0','["2 и 3","−2 и −3","1 и 6","−1 и −6"]'::jsonb,0,'Разложение: (x − 2)(x − 3) = 0, значит x = 2 или x = 3.'),
('math','Advanced Math','Medium',NULL,'Каковы координаты вершины параболы y = (x − 3)² + 4?','["(3, 4)","(−3, 4)","(3, −4)","(4, 3)"]'::jsonb,0,'Вершинная форма y = (x − h)² + k даёт вершину (h, k) = (3, 4).'),
('math','Advanced Math','Medium',NULL,'Решите: 2^(x+1) = 16','["2","3","4","5"]'::jsonb,1,'16 = 2⁴, значит x + 1 = 4 и x = 3.'),
('math','Advanced Math','Hard',NULL,'Сколько действительных решений имеет уравнение x² + 4x + 5 = 0?','["0","1","2","бесконечно много"]'::jsonb,0,'Дискриминант = 16 − 20 = −4 < 0, значит действительных корней нет.'),
('math','Problem-Solving & Data Analysis','Easy',NULL,'Чему равно среднее арифметическое чисел 4, 8, 10 и 14?','["8","9","10","11"]'::jsonb,1,'Сумма = 36, делим на 4 элемента: 36/4 = 9.'),
('math','Problem-Solving & Data Analysis','Easy',NULL,'Сколько составляет 20% от 250?','["25","40","50","60"]'::jsonb,2,'0,20 × 250 = 50.'),
('math','Problem-Solving & Data Analysis','Easy',NULL,'Найдите медиану набора: 3, 7, 9, 15, 21','["7","9","11","15"]'::jsonb,1,'Числа упорядочены, средний элемент из пяти — третий, то есть 9.'),
('math','Problem-Solving & Data Analysis','Medium',NULL,'Цена товара 80 $ выросла на 25%. Какова новая цена?','["95 $","100 $","105 $","120 $"]'::jsonb,1,'80 × 1,25 = 100.'),
('math','Problem-Solving & Data Analysis','Medium',NULL,'Два числа в отношении 3 : 5, их сумма равна 40. Чему равно меньшее число?','["12","15","18","24"]'::jsonb,1,'3k + 5k = 40 → 8k = 40 → k = 5. Меньшее: 3·5 = 15.'),
('math','Problem-Solving & Data Analysis','Medium',NULL,'В коробке 12 шаров, 3 из них красные. Какова вероятность вытащить красный шар?','["1/4","1/3","1/12","3/4"]'::jsonb,0,'3/12 = 1/4.'),
('math','Geometry & Trigonometry','Easy',NULL,'В прямоугольном треугольнике катеты равны 6 и 8. Чему равна гипотенуза?','["9","10","12","14"]'::jsonb,1,'По теореме Пифагора: √(36 + 64) = √100 = 10.'),
('math','Geometry & Trigonometry','Easy',NULL,'Чему равна площадь круга радиусом 5?','["10π","20π","25π","50π"]'::jsonb,2,'S = πr² = π·25 = 25π.'),
('math','Geometry & Trigonometry','Easy',NULL,'Чему равен sin 30°?','["1/2","√2/2","√3/2","1"]'::jsonb,0,'Это стандартное значение: sin 30° = 1/2.'),
('math','Geometry & Trigonometry','Easy',NULL,'Два угла треугольника равны 50° и 60°. Чему равен третий угол?','["60°","70°","80°","90°"]'::jsonb,1,'Сумма углов треугольника 180°: 180 − 110 = 70.'),
('math','Geometry & Trigonometry','Medium',NULL,'Длина окружности равна 12π. Чему равен её диаметр?','["6","12","18","24"]'::jsonb,1,'C = πd, значит d = 12.'),
('math','Geometry & Trigonometry','Hard',NULL,'Треугольники подобны с коэффициентом 3. Во сколько раз площадь большего больше?','["3","6","9","12"]'::jsonb,2,'Площади подобных фигур соотносятся как квадрат коэффициента: 3² = 9.'),
('rw','Information & Ideas','Easy','When a honeybee finds a rich patch of flowers, it returns to the hive and performs a looping "waggle dance." The angle of the dance signals the direction of the flowers relative to the sun, and its duration signals distance. Hive mates that observe the dance can then fly directly to the patch.','Which choice best states the main idea of the text?','["The waggle dance communicates the location of food to other bees.","Honeybees prefer flowers that grow near the hive.","Bees dance mainly to attract mates.","The sun determines when bees leave the hive."]'::jsonb,0,'Текст описывает, как угол и длительность танца передают направление и расстояние до цветов, — то есть танец сообщает местоположение еды.'),
('rw','Information & Ideas','Medium','A city planner studied twelve neighborhoods that added community gardens. In each one, residents reported knowing more of their neighbors by name two years later, though the number of gardeners was small relative to the population.','Which choice most logically completes the inference from the text?','["Community gardens may strengthen social ties beyond the people who garden.","Only gardeners benefit from community gardens.","Community gardens reduce housing costs.","Most residents in the study became gardeners."]'::jsonb,0,'Садовников было мало, но знакомств стало больше у жителей в целом — значит эффект выходит за пределы самих садовников.'),
('rw','Information & Ideas','Medium','Researchers claim that urban trees lower summer temperatures on nearby streets.','Which finding, if true, would most directly support the researchers'' claim?','["Streets with dense tree cover measured 3°C cooler at midday than nearby treeless streets.","Residents say they enjoy walking under trees.","Tree planting programs have grown in popularity.","Trees absorb carbon dioxide from the air."]'::jsonb,0,'Прямое подтверждение — измеренная разница температуры между улицами с деревьями и без них.'),
('rw','Information & Ideas','Medium','A survey of 400 students found that 62% who slept at least eight hours reported strong focus in morning classes, compared with 28% of those who slept fewer than six hours.','Which choice best describes the data presented?','["Students who slept longer reported strong focus more than twice as often.","Sleep has no measurable relationship to reported focus.","Most students in the survey slept fewer than six hours.","Focus was highest among students sleeping under six hours."]'::jsonb,0,'62% против 28% — более чем двукратная разница в пользу тех, кто спал дольше.'),
('rw','Information & Ideas','Medium','Mary Anning, a self-taught fossil collector in early 19th-century England, discovered specimens that reshaped scientific understanding of prehistoric life. Because she was a woman without formal training, papers describing her finds were often published under other names.','What is the central idea of the text?','["Anning made major scientific contributions that were often credited to others.","Anning had no interest in scientific recognition.","Anning trained many professional geologists.","Fossil collecting was a common profession for women at the time."]'::jsonb,0,'Текст соединяет её важные открытия и то, что публикации выходили под чужими именами.'),
('rw','Information & Ideas','Hard','Deep-sea anglerfish carry colonies of bioluminescent bacteria in a fleshy lure. The fish cannot produce light itself; the bacteria supply it in exchange for nutrients and shelter.','According to the text, why does the anglerfish depend on bacteria?','["It lacks the ability to generate light on its own.","It cannot digest nutrients without them.","Its lure grows only in bacterial colonies.","It uses bacteria to navigate in currents."]'::jsonb,0,'В тексте прямо сказано: рыба сама не производит свет, его дают бактерии.'),
('rw','Craft & Structure','Easy','The committee''s report was praised for its ROBUST evidence: every claim rested on data from at least three independent studies.','As used in the text, what does the word "robust" most nearly mean?','["strong","rude","physical","brief"]'::jsonb,0,'Контекст (данные минимум трёх независимых исследований) указывает на «прочный, надёжный, сильный».'),
('rw','Craft & Structure','Medium','Although the museum''s collection is modest in size, its holdings are remarkably CATHOLIC, ranging from Sumerian tablets to contemporary video art.','As used in the text, what does the word "catholic" most nearly mean?','["wide-ranging","religious","expensive","ancient"]'::jsonb,0,'Диапазон «от шумерских табличек до видеоарта» показывает широту охвата.'),
('rw','Craft & Structure','Medium','The engineer''s explanation was so SPARE that listeners had to reconstruct the missing steps themselves.','As used in the text, what does the word "spare" most nearly mean?','["minimal","extra","generous","thin"]'::jsonb,0,'Слушателям пришлось достраивать пропущенные шаги — объяснение было предельно скупым.'),
('rw','Craft & Structure','Medium','Before presenting her own model of glacier retreat, the author devotes two pages to summarizing three competing explanations that researchers have proposed.','Which choice best describes the function of the two-page summary in the text?','["It establishes the context of existing views that the author''s model will address.","It concedes that the author''s model is unnecessary.","It provides evidence that glaciers are retreating.","It criticizes researchers for ignoring the topic."]'::jsonb,0,'Обзор конкурирующих объяснений перед собственной моделью задаёт контекст, в который автор вписывает свою идею.'),
('rw','Craft & Structure','Hard','Text 1: A biologist argues that bird migration routes are inherited, citing young birds that navigate correctly on a first solo flight. Text 2: Another biologist emphasizes that migrating flocks led by experienced adults follow shorter, safer routes than lone juveniles.','Based on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?','["By acknowledging an inherited basis while stressing the role of learning from adults.","By denying that young birds can migrate at all.","By arguing that migration routes are chosen at random.","By agreeing that experience plays no meaningful role."]'::jsonb,0,'Автор Текста 2 не отрицает врождённую основу, но подчёркивает вклад обучения у опытных взрослых птиц.'),
('rw','Craft & Structure','Hard','The novel opens with a wedding, then abruptly shifts to the same characters twenty years later, leaving the intervening decades to be pieced together from stray remarks.','Which choice best describes the overall structure of the text as presented?','["A jump in time that requires the reader to infer what happened between.","A strictly chronological account of two decades.","A comparison of two unrelated families.","A step-by-step argument supported by evidence."]'::jsonb,0,'Резкий сдвиг на двадцать лет вперёд оставляет пропуск, который читатель восстанавливает по отдельным репликам.'),
('rw','Expression of Ideas','Easy','Solar panel prices fell sharply over the past decade. ______ installations in many countries grew faster than governments had forecast.','Which choice completes the text with the most logical transition?','["As a result,","Nevertheless,","For example,","In contrast,"]'::jsonb,0,'Между удешевлением панелей и ростом установок — причинно-следственная связь.'),
('rw','Expression of Ideas','Medium','The new bridge design uses less steel than the original plan. ______ it is expected to withstand stronger winds.','Which choice completes the text with the most logical transition?','["Even so,","Therefore,","Likewise,","In other words,"]'::jsonb,0,'Меньше стали, но выше устойчивость — это контраст, нужна уступительная связка.'),
('rw','Expression of Ideas','Medium','Coral reefs cover less than 1% of the ocean floor. ______ they shelter roughly a quarter of all marine species.','Which choice completes the text with the most logical transition?','["Yet","Consequently,","Similarly,","Thus,"]'::jsonb,0,'Маленькая площадь и огромное биоразнообразие противопоставлены.'),
('rw','Expression of Ideas','Medium','Notes: • The library was built in 1904. • It was designed by architect Ellen Marsh. • It was the first public library in the county. • It is still open today.','The student wants to emphasize the library''s historical significance. Which choice most effectively uses the notes to accomplish this goal?','["Built in 1904, the library was the county''s first public library and remains open today.","The library, designed by Ellen Marsh, is open today.","Ellen Marsh was an architect who designed a library in 1904.","The library is open today and was built long ago."]'::jsonb,0,'Вариант объединяет дату, статус «первая публичная библиотека округа» и работу по сей день — именно историческую значимость.'),
('rw','Expression of Ideas','Medium','Notes: • Researchers tracked 60 wolves. • They used GPS collars. • Wolves avoided roads at night. • The finding may inform highway planning.','The student wants to present the study''s practical implication. Which choice best accomplishes this goal?','["Because GPS tracking showed that wolves avoid roads at night, the findings could guide highway planning.","Researchers tracked 60 wolves using GPS collars.","Wolves are known to avoid roads.","GPS collars are useful tools for researchers."]'::jsonb,0,'Только этот вариант связывает результат исследования с практическим применением в планировании дорог.'),
('rw','Expression of Ideas','Hard','Notes: • Kintsugi is a Japanese repair art. • Broken pottery is mended with gold lacquer. • Cracks are highlighted, not hidden. • The practice dates to the 15th century.','The student wants to explain what makes kintsugi distinctive. Which choice best accomplishes this goal?','["In kintsugi, broken pottery is mended with gold lacquer so that the cracks are highlighted rather than hidden.","Kintsugi is a Japanese art that dates to the 15th century.","Kintsugi requires gold lacquer and broken pottery.","Japanese artists have repaired pottery for centuries."]'::jsonb,0,'Отличительная черта кинцуги — подчёркивание трещин золотом, а не их скрытие.'),
('rw','Standard English Conventions','Easy',NULL,'Which choice completes the text so that it conforms to the conventions of Standard English? "The collection of essays ______ several new translations."','["includes","include","including","are including"]'::jsonb,0,'Подлежащее — «collection» (единственное число), поэтому нужна форма includes.'),
('rw','Standard English Conventions','Easy',NULL,'Which choice completes the text so that it conforms to the conventions of Standard English? "Dr. Reyes, a marine geologist ______ mapped the trench for a decade."','["who has","who have","whom has","which has"]'::jsonb,0,'Нужен относительное местоимение who в роли подлежащего и has для единственного числа.'),
('rw','Standard English Conventions','Medium',NULL,'Which choice completes the text so that it conforms to the conventions of Standard English? "The lab published its results in March ______ the findings were confirmed by two other teams."','["; later,","later,",", later","later;"]'::jsonb,0,'Два самостоятельных предложения соединяются точкой с запятой, иначе получится comma splice.'),
('rw','Standard English Conventions','Medium',NULL,'Which choice completes the text so that it conforms to the conventions of Standard English? "Each of the students submitted ______ portfolio before the deadline."','["a","their","there","its"]'::jsonb,0,'«Each» единственного числа; корректно «a portfolio» (или his or her), но не their.'),
('rw','Standard English Conventions','Medium',NULL,'Which choice completes the text so that it conforms to the conventions of Standard English? "The novel, a bestseller in 1927 ______ adapted for the stage the following year."','[", was","was","; was",": was"]'::jsonb,0,'Вставная конструкция выделяется запятыми с двух сторон, поэтому нужна вторая запятая перед was.'),
('rw','Standard English Conventions','Hard',NULL,'Which choice completes the text so that it conforms to the conventions of Standard English? "By the time the storm reached the coast, forecasters ______ their warnings twice."','["had revised","have revised","revise","are revising"]'::jsonb,0,'Действие завершилось до другого события в прошлом — нужен past perfect: had revised.');
