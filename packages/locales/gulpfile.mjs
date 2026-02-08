import gulp from "gulp";
import path from "path";
import fs from "fs";
import { deleteAsync } from "del";
import through2 from "through2";
import eslint from "gulp-eslint-new";
import ts from "gulp-typescript";

export async function clean() {
  return deleteAsync(["./src/**/*", "./dist/**/*"]);
}

export function copyLocales() {
  return gulp.src("./locales/**/*.json").pipe(gulp.dest("./dist/locales"));
}

export function generateLocalesTs() {
  return gulp.src("./locales/**/*.json").pipe(
    through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        const lng = path.basename(path.dirname(file.path));
        const jsonContent = JSON.parse(file.contents.toString());
        const tsContent = `export default ${JSON.stringify(
          jsonContent,
          null,
          2,
        )} as const;`//.replace(/{{(.*?)}}/g, "{$1}"); // 模版参数格式不同 {{}} => {}
        fs.writeFileSync(path.join("./src", `${lng}.ts`), tsContent);
      }
      cb(null, file);
    }),
  );
}

export function lintFixLocalesTs() {
  return gulp
    .src(["./src/**/*.ts"])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest((file) => file.base));
}

const tsProject = ts.createProject({ declaration: true });

export function compileLocalesTs() {
  return gulp.src(["./src/**/*.ts"]).pipe(tsProject()).pipe(gulp.dest("./dist"));
}

export const buildLocales = gulp.series(generateLocalesTs, lintFixLocalesTs, compileLocalesTs);

export const build = gulp.series(clean, gulp.parallel(copyLocales, buildLocales));

export function watchLocales() {
  return gulp.watch("./locales/**/*.json", gulp.parallel(copyLocales, buildLocales));
}

export const dev = gulp.series(build, watchLocales);

export default build;
