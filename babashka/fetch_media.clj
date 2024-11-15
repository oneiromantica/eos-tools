(require '[cheshire.core :as json])
(require '[babashka.curl :as curl])
(require '[clojure.java.io :as io])
(require '[clojure.string :as str])
(require '[babashka.cli :as cli])
(require '[babashka.fs :as fs])
(require '[progrock.core :as pr])

(def i-am-a-browser "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0")

(defn file-name [kind hash]
  (let [suffix (if (= :audio kind) ".mp3" ".jpg")]
    (str hash suffix)))

(defn remote-url [kind hash]
  (let [base-url "https://media.milovana.com"
        prefix (if (= :audio kind) (str base-url "/timg/") (str base-url "/timg/tb_xl/"))]
    (str prefix (file-name kind hash))))

(defn local-url [kind hash]
  (let [prefix (if (= :audio kind) "./timg/" "./timg/tb_xl/")]
    (str prefix (file-name kind hash))))

(defn file-hashes [kind data]
  (->> (get data "files" [])
       vals
       (filter #(str/starts-with? (get % "type") kind))
       (map #(get % "hash"))))

(defn without-existing [type hashes]
  (remove #(fs/exists? (local-url type %)) hashes))

(defn audio-files [data] (without-existing :audio (file-hashes "audio" data)))

(defn image-files [data]
  (let [additional-images (file-hashes "image" data)]
    (->> (get data "galleries")
         vals
         (mapcat #(get % "images"))
         (map #(get % "hash"))
         (concat additional-images)
         (without-existing :image))))

(def loaded (atom 0))
(defn fetch-file [kind progress hash]
  (io/copy  (:body (curl/get (remote-url kind hash)
                             {:user-agent i-am-a-browser, :retry 5, :retry-all-errors true, :as :stream
                              :raw-args ["--retry" "5", "--retry-all-errors"]
                              :throw false}))
            (io/file (local-url kind hash)))
  (swap! loaded inc)
  (pr/print (pr/tick progress @loaded)))
(def fetch-image-file (partial fetch-file :image))
(def fetch-audio-file (partial fetch-file :audio))

(let [{:keys [file]} (cli/parse-opts *command-line-args* {:spec {:file {:default "eosscript.json"}}})
      json-data (json/parse-stream (io/reader file))
      sounds (audio-files json-data)
      images (image-files json-data)
      total (+ (count sounds) (count images))
      progress (pr/progress-bar total)]
  (when (not (fs/exists? "timg/tb_xl"))
    (fs/create-dirs "timg/tb_xl"))
  (println "To load:" total "files.")
  (when (pos? total)
    (pr/print progress)
    (doall (pmap (partial fetch-image-file progress) images))
    (doall (pmap (partial fetch-audio-file progress) sounds))
    (pr/print (pr/done (pr/tick progress @loaded)))))
