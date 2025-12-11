<?php
class Controller {
    protected function authUserFromRequest($request){
        $hdr = $request->header('Authorization') ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if(!$hdr) return null;
        if(!str_starts_with($hdr,'Bearer ')) return null;
        $token = trim(substr($hdr,7));
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare('SELECT id,name,email,role FROM users WHERE token = :t');
        $stmt->execute([':t'=>$token]);
        return $stmt->fetch() ?: null;
    }
}
